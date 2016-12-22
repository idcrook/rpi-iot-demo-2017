#!/bin/bash
# Script: pi-temp.sh
# Purpose: Display the CPU and GPU temperature of Raspberry Pi

#
GPU=`/opt/vc/bin/vcgencmd measure_temp | cut -c6-9`

# requires temp in Celsius to be below 100°C
CPUOUT=`cat /sys/class/thermal/thermal_zone0/temp`
CPU=`cut -c1-2 <<< $CPUOUT`.`cut -c3-5 <<< $CPUOUT`


echo "// $(date) - $(hostname)"
echo "${GPU}"
echo "${CPU}"
