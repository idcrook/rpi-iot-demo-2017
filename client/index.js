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
    onoff = require('onoff'),
    uuid = require('uuid');


// Read in config file
var configFile = './client-config.json';
var config = jsonfile.readFileSync(configFile);
console.dir(config);

// Lookup MQTT broker IP address
// If this lookup fails (cannot resolve broker), will raise an exception
var brokerAddr = dns.lookup(config.mqttBrokerHost, {family: 4} ,  (err, address, family) => {
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
//     |-> cputemp        - degrees C
//     `-> gputemp        - degrees C

// So subscribing to topic 'iot-demo/+/connected' is connected status across
// all the clients

const baseTopic = 'iot-demo' + '/' + clientId;
const pubConnected = baseTopic + '/connected';
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

// GET endpoint for retrieving details about this client.
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
      client.publish(pubCpuTemp, readout.cpuTemp.toString(), {qos: 0, retain: true});
      client.publish(pubGpuTemp, readout.gpuTemp.toString(), {qos: 0, retain: true});
    }

    // Schedule onto event loop for many many more times
    if (this.totalReads < 9999999) {
      setTimeout(function() {
        sensor.read();
      }, config.sensorReadInterval);
    }
  }
};


if (sensor.initialize()) {
  // Launch the main Sensor Read+Publish LOOP!
  sensor.read();
} else {
  var errMsg = 'Failed to initialize sensor';
  console.warn(errMsg);
  throw new Error(errMsg);
}

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

  if (options.cleanup) {
    // Turns out LWT (Last Will and Testament) MQTT feature in library will
    // handle this (need a synchronous version for it to work right anyway)
    client.publish(pubConnected, 'false', {qos: 1, retain: true}, function() {
      console.log(pubConnected + " is published");
      client.end(); // Close the connection when published
    });
    console.log('handleAppExit cleanup');
  }

  if (options.exit) {
    console.log('');
    console.log('handleAppExit exit');
    process.exit(errorCode);
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
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))
