#!/bin/bash -x

# Requires node package MQTT.js CLI to be installed globally
#     npm install mqtt -g

# also needs the following client to be running:
#     pi@rpit5 ~/iot-demo/client $ node switch-led-subscribe.js

broker_host=rpit5.local
led_topic=iot-demo/rpit5/raspi/greenled

while [ /bin/true ] ; do
    mqtt pub -h ${broker_host} -t ${led_topic} -m "on"
    sleep 1
    mqtt pub -h ${broker_host} -t ${led_topic} -m "off"
    sleep 1
done
