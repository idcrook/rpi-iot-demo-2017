#!/usr/bin/env node

var cp = require("child_process");
var fs = require("fs");


var cpu_temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
cpu_temp = ((cpu_temp/1000).toPrecision(3));

var vcgencmd = cp.spawnSync('/opt/vc/bin/vcgencmd', ['measure_temp']);
var gpu_temp = vcgencmd.stdout.toString().replace("\n", "").replace("temp=", "").replace("'C","");

console.log(`CPU: ${cpu_temp}°C`);
console.log(`GPU: ${gpu_temp}°C`);
