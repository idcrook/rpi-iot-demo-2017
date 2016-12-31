/* jshint undef: true, node: true */

var os = require('os'),
    dns = require('dns'),
    cp = require("child_process"),
    fs = require("fs"),
    path = require("path"),

    express = require('express'),
    ip = require('ip'),
    jsonfile = require('jsonfile'),
    mqtt = require('mqtt'),
    Gpio = require('onoff').Gpio,
    uuid = require('uuid');


// Read in config file
var configFile = './client-config.json';
var config = jsonfile.readFileSync(configFile);
console.dir(config);

var APP_EXITING = false;

// Lookup MQTT broker IP address
// If this lookup fails (cannot resolve broker), will raise an exception
var brokerAddr = dns.lookup(config.mqttBrokerHost, {family: 4} , (err, address, family) => {
  if (err) throw err;
  console.log('MQTT broker: '+address+` (${config.mqttBrokerHost})`);
  return address;
});

// determine our hostname (and derived names)
var clientHostname = os.hostname() ;
var clientHostnameLocal = clientHostname + ".local";
var clientId = clientHostname;
console.log('MQTT client: '+clientHostname);

// Topic Structure
// =================
// iot-demo     \
// `-<clientId>  } base topic for this client
//   |          /
//   |-> connected        - 'true' or 'false'
//   `-raspi
//     |-> redled         - 'on' or 'off'
//     |-> greenled       - 'on' or 'off'
//     |-> cputemp        - degrees C
//     `-> gputemp        - degrees C

// So subscribing to topic 'iot-demo/+/connected' is connected status across
// all the clients

const baseTopic = 'iot-demo' + '/' + clientId;

const pubConnected = baseTopic + '/connected';
const pubRedLed   = baseTopic + '/raspi/redled';
const pubGreenLed = baseTopic + '/raspi/greenled';
const pubCpuTemp = baseTopic + '/raspi/cputemp';
const pubGpuTemp = baseTopic + '/raspi/gputemp';

const connectUrl = 'mqtt://' + config.mqttBrokerHost;
const connectOptions = {
  clientId: clientId + '-' + uuid.v4(),
  will: {
    topic: pubConnected,
    payload: new Buffer('false'),
    qos: 1,
    retain: true
  }
};

// Create webserving framework
var app = express();

// HTTP serve static content - files in 'public' subdirectory will be served.
app.use(express.static(path.join(__dirname, 'public')));

// HTTP GET endpoint for retrieving details about this client.
//
// For example, used in WebSockets streaming demo page to let page know which
// topic contains the info for this client
app.get('/api/config', function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var obj = {
    mqttBrokerHost: config.mqttBrokerHost,
    mqttBrokerPortWebsockets: config.mqttBrokerPortWebsockets,
    baseTopic: baseTopic,
    subTopic1: '/raspi/cputemp',
    subTopic2: '/raspi/gputemp'
  };

  console.log("API request from " + ip + " ...");
  console.dir(obj);

  if( true ) {
    res.status(200).json(obj);
  } else {
    res.status(400).send('error');
  }
});

// Start webserver listening (usually port 3000)
var server = app.listen(config.expressServerPort, function () {
  var host = server.address().address;
  var port = server.address().port;
  var addr = ip.address();
  // console.dir(addr);
  console.log(' * ');
  console.log(' * HTTP server            http://%s:%s', addr, port);
  console.log(' * HTTP server alt addr   http://%s:%s', clientHostnameLocal, port);
  console.log(' * ');
});

// Connect an MQTT client object
const client = mqtt.connect(connectUrl, connectOptions);

// Process MQTT connection acknowledgement event
client.on('connect', (connack) => {
  if (connack.returnCode !== 0) {
    console.dir(connack);
  }
  client.publish(pubConnected, 'true', {qos: 1, retain: true});
  console.log(pubConnected);
});


// Parts of the following code inspired by
// http://blog.dioty.co/2014/12/raspberry-pi-sensors-and-dioty-mqtt.html

// Utility object to perform the actual sensor reads
var piTempLib = {
  // this is synchronous. an asynchronous version would be better
  readSync: function() {
    // CPU temperature sensor value is available in Linux sysfs
    var cpu_temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    cpu_temp = ((cpu_temp/1000).toPrecision(3));

    // GPU temperature sensor can be read using a utility program
    var vcgencmd = cp.spawnSync('/opt/vc/bin/vcgencmd', ['measure_temp']);
    var gpu_temp = vcgencmd.stdout.toString().replace("\n", "").replace("temp=", "").replace("'C","");

    var obj = {
      cpuTemp: cpu_temp,
      gpuTemp: gpu_temp,
      isValid: true,
      errors: 0
    };
    return obj;
  },

  fakeread: function() {
    var obj = {
      cpuTemp: 35.5,
      gpuTemp: 35.6,
      isValid: true,
      errors: 0
    };
    return obj;
  }
};

// Make an object to wrap sensor reads, as well as publish to MQTT topics
var sensor = {
  initialize: function() {
    this.totalReads = 0;
    return true;
  },

  read: function() {
    var readout = piTempLib.readSync();
    this.totalReads++;
    console.log('cpu: '+readout.cpuTemp+' gpu: '+readout.gpuTemp+
                ', valid: '+readout.isValid+
                ', errors: '+readout.errors);

    if (readout.isValid) {
      /* client.publish(pubCpuTemp, readout.cpuTemp.toString(), {qos: 0, retain: true});
       * client.publish(pubGpuTemp, readout.gpuTemp.toString(), {qos: 0, retain: true});*/
      client.publish(pubCpuTemp, readout.cpuTemp.toString(), {qos: 0, retain: false});
      client.publish(pubGpuTemp, readout.gpuTemp.toString(), {qos: 0, retain: false});
    }

    // Schedule onto event loop for many many more times
    if (this.totalReads < 9999999) {
      setTimeout(function() {
	if (! APP_EXITING) {
          sensor.read();
	}
      }, config.sensorReadInterval);
    }
  }
};


if (sensor.initialize()) {
  // Launch the main Sensor Read + MQTT Publish LOOP!
  sensor.read();
} else {
  var errMsg = 'Failed to initialize sensor';
  console.warn(errMsg);
  throw new Error(errMsg);
}

// GPIO for LEDs and switch
var button_Gpio = 4;
var redLed_Gpio = 17;
var greenLed_Gpio = 27;

// Header pin  | BCM Gpio pin   | WiringPi
////////////////////////////////////////////
//   1         |                |
//   3         |  2		|  8
//   5         |  3		|  9
//   7         |  4 (button)	|  7
//   9         |  		|
//  11         | 17 (red LED)	|  0
//  13         | 27 (green LED) |  2
//  15         | 22             |  3


// Configure the button pin, and set interrupts on both rising and falling
// edges

// Has internal pullup enabled by default on powerup. See:
//   https://www.raspberrypi.org/forums/viewtopic.php?f=28&t=115274
//   http://www.farnell.com/datasheets/1521578.pdf
//    - Table 6-31 on pages 102 and 103

// debounceTimeout described in onoff source code
// https://github.com/fivdi/onoff/blob/master/onoff.js#L51
var button = new Gpio(button_Gpio, 'in', 'both', {debounceTimeout: 20});

// get onoff objects for the LED pins
var redLed = new Gpio(redLed_Gpio, 'low');
var greenLed = new Gpio(greenLed_Gpio, 'low');

var buttonPressedCount = 0;
var buttonReleasedCount = 0;

console.log('Starting Watch for Button');

client.publish(pubRedLed, 'off', {qos: 1, retain: true});
redLed.writeSync(0); // 1 = on, 0 = off
client.publish(pubGreenLed, 'off', {qos: 1, retain: true});
greenLed.writeSync(0); // 1 = on, 0 = off

button.watch(function (err, value) {
  if (err) {
    console.log('ERROR: ' + error)
  }
  if (value === 0) {
    console.log('BUTTON PRESSED!');
    // implement a toggle based on button presses
    buttonPressedCount += 1;
    if (buttonPressedCount % 2) {
      client.publish(pubRedLed, 'on', {qos: 1, retain: true});
      redLed.writeSync(1); // 1 = on, 0 = off
    } else {
      client.publish(pubRedLed, 'off', {qos: 1, retain: true});
      redLed.writeSync(0); // 1 = on, 0 = off
    }
  } else {
    console.log('BUTTON RELEASED!');
    buttonReleasedCount += 1;
    if (buttonReleasedCount % 2) {
      client.publish(pubGreenLed, 'on', {qos: 1, retain: true});
      greenLed.writeSync(1); // 1 = on, 0 = off
    } else {
      client.publish(pubGreenLed, 'off', {qos: 1, retain: true});
      greenLed.writeSync(0); // 1 = on, 0 = off
    }
  }
});

// Some of the following code borrowed ideas from
// https://blog.risingstack.com/getting-started-with-nodejs-and-mqtt/

/**
 * Want to handle Ctrl-C and other exits gracefully
 *
 */
function handleAppExit (options, err) {
  var errorCode = 0;
  if (err) {
    console.log(err.stack);
    errorCode = 1;
  }

  if (options.exit) {
    APP_EXITING = true;
  }

  if (options.cleanup) {

    console.log('turning off LEDs');
    client.publish(pubRedLed, 'off', {qos: 1, retain: true}, function() {
      console.log(pubRedLed + " is published");
      redLed.writeSync(0);   // 1 = on, 0 = off
    });
    client.publish(pubGreenLed, 'off', {qos: 1, retain: true},  function() {
      console.log(pubGreenLed + " is published");
      greenLed.writeSync(0); // 1 = on, 0 = off
    });

    client.publish(pubCpuTemp, '0.0', {qos: 0, retain: true});
    client.publish(pubGpuTemp, '0.0', {qos: 0, retain: true});


    // Turns out LWT (Last Will and Testament) MQTT feature in library also
    // handles this
    client.publish(pubConnected, 'false', {qos: 1, retain: true}, function() {
      console.log(pubConnected + " is published");
    });
    console.log('handleAppExit cleanup');
  }

  if (options.exit) {
    console.log('handleAppExit exit (delaying onset by 2000 ms)');
    setTimeout(function() { process.exit(errorCode);}, 2000);

  }
}

//// Begin reading from stdin so the process does not exit.
//process.stdin.resume();

// Handle a SIGINT (Ctrl-C), etc. here

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  cleanup: true,
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))
