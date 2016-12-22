#!/usr/bin/env node

var cp = require("child_process");
var fs = require("fs");

var cpu_temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
cpu_temperature = ((cpu_temperature/1000).toPrecision(3));

console.log(`CPU: ${cpu_temperature}°C`);


var child = cp.exec('/opt/vc/bin/vcgencmd measure_temp', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`GPU: ${stdout}`);
  //console.log(`stderr: ${stderr}`);
});
