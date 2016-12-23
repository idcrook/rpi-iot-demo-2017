
var     os = require('os'),
	dns = require('dns'),
	cp = require("child_process"),
	fs = require("fs"),
	ip = require('ip'),
	jsonfile = require('jsonfile'),
	express = require('express'),
	mqtt = require('mqtt');

// Read in config file
var configFile = './client-config.json';
var config = jsonfile.readFileSync(configFile);
console.dir(config);

// determine our IP address
var addr = ip.address();
console.log('my addr: '+addr);

// determine our hostname
var clientHostname = os.hostname() ;
var clientId = clientHostname;
var clientHostnameLocal = clientHostname + ".local";
console.log('clientHostname: '+clientHostname);

var brokerAddr = dns.lookup(config.mqttBrokerHost, {family: 4} ,  (err, address, family) => {
  if (err) throw err;
  //console.log('IP Family: '+family);
  console.log('broker addr: '+address);
  return address;
});


// Topic Structure
// =================
// iot-demo     \
// `-<clientId>  } base topic for this client
//   |          /
//   |-> connected        - 'true' or 'false'
//   `-raspi
//     |-> cputemp        - degrees C
//     `-> gputemp        - degrees C

// So subscribing to topic 'iot-demo/+/connected' is connected status

const baseTopic = 'iot-demo' + '/' + clientId;
const pubConnected = baseTopic + '/connected';
const pubCpuTemp = baseTopic + '/raspi/cputemp';
const pubGpuTemp = baseTopic + '/raspi/gputemp';

const connectUrl = 'mqtt://' + config.mqttBrokerHost;
const connectOptions = {
  clientId: clientId,
  will: {
    topic: pubConnected,
    payload: new Buffer('false'),
    qos: 1,
    retain: true
  }
};

// Create MQTT client
const client = mqtt.connect(connectUrl, connectOptions);


client.on('connect', (connack) => {
  if (connack.returnCode !== 0) {
    console.dir(connack);
  }
  client.publish(pubConnected, 'true', {qos: 1, retain: true});
  console.log(pubConnected);
});


// inspired by
// http://blog.dioty.co/2014/12/raspberry-pi-sensors-and-dioty-mqtt.html

var piTempLib = {
  // this is synchronous for now
  readSync: function() {
    var cpu_temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    cpu_temp = ((cpu_temp/1000).toPrecision(3));

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

    if (this.totalReads < 9999999) {
      setTimeout(function() {
        sensor.read();
      }, 2000);
    }
  }
};


if (sensor.initialize()) {
  sensor.read();
} else {
  console.warn('Failed to initialize sensor');
}


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
    // LWT will handle this

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

// Begin reading from stdin so the process does not exit. requires a SIGINT (Ctrl-C), etc.
process.stdin.resume();

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
