
var ip = require('ip'),
    os = require('os'),
    dns = require('dns'),
    jsonfile = require('jsonfile'),
    express = require('express'),
    mqtt = require('mqtt');

// Read in config file
var configFile = './client-config.json';
var config = jsonfile.readFileSync(configFile);
console.dir(config);

// determine our IP address
var addr = ip.address();
console.log('addr: '+addr);

// determine our hostname
var clientHostname = os.hostname() ;
var clientHostnameLocal = clientHostname + ".local";
console.log('clientHostname: '+clientHostname);

/* var brokerAddr = dns.lookup(config.mqttBrokerHost, {family: 4} ,  (err, address, family) => {
 *   if (err) throw err;
 *   //console.log('IP Family: '+family);
 *   console.log('brokerAddr: '+address);
 *   return address;
 * });
 * */

const client = mqtt.connect('mqtt://' + config.mqttBrokerHost);

// Structure
//
// clientHostname
//   |-> connected
//   |-> cpuTemp
//   `-> gpuTemp

var pubConnected = '/' + clientHostname + '/connected';
var pubCpuTemp = '/' + clientHostname + '/temp/cpu';
var pubGpuTemp = '/' + clientHostname + '/temp/gpu';

client.on('connect', () => {
  console.log(pubConnected);
  client.publish(pubConnected, 'true');
});

/* client.on('disconnect', () => {
 *   console.log("disconnected");
 *   client.publish(pubConnected, 'false');
 * });*/

// inspired by
// http://blog.dioty.co/2014/12/raspberry-pi-sensors-and-dioty-mqtt.html

var piTempLib = {
  read: function() {
    var obj = {
      cpuTemp: 35.5,
      gpuTemp: 35.6,
      isValid: true,
      errors: 0
    };
    return obj;
  }

}

var sensor = {
  initialize: function() {
    this.totalReads = 0;
    return true;
  },

  read: function() {
    var readout = piTempLib.read();
    this.totalReads++;
    console.log('cpu: '+readout.cpuTemp+' gpu: '+readout.gpuTemp+
                ', valid: '+readout.isValid+
                ', errors: '+readout.errors);

    if (readout.isValid) {
      client.publish(pubCpuTemp, readout.cpuTemp.toString(), {retain: true});
      client.publish(pubGpuTemp, readout.gpuTemp.toString(), {retain: true});
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
