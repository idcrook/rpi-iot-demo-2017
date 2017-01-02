

# MQTT demo client for Raspberry Pi

Javascript app (node.js) that reads temperatures on a Pi and [makes available using MQTT](#mqtt-topic-structure).

The client code also:
 - Runs webserver for displaying MQTT data [charts](#temperature-chart) and [diagrams](#dashboard).
 - Talks to Pi GPIO hardware, [reading switches and controlling LEDs](https://github.com/idcrook/rpi-iot-demo-2017/blob/master/client/index.js#L240-L273).

### Temperature Chart

![](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/TemperatureChart_resize1.png)

### Dashboard

![](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/RasPi_IoT_Dashboard_animation.gif)

## Requirements

 - node.js - Recommend node.js installation using NVM. Tested with latest node.js (v7.3.0).
   - Refer to [PI_PREP.md](../info/PI_PREP.md)
 - MQTT Broker running on network, with WebSockets enabled
   - This demo uses [mosquitto](https://mosquitto.org/) running on a Pi Model 2. Refer to [config](../conf/raspi-demo.conf) and [PI_PREP.md](../info/PI_PREP.md#pi-mqtt-broker-using-mosquitto).
 - Raspberry Pi. - Tested with Raspbian jessie on Pi 2 and Pi B+ models
   - (OPTIONAL) LEDs, Resistors, capacitor, a switch and wiring. See [SCHEMATICS.md](../info/SCHEMATICS.md) for details.

## MQTT Topic Structure

MQTT PubSub topic structure being used in this demo

``` javascript
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
```

So Topic "`iot-demo/+/connected`" is **status** across all the clients

## Implementation

 - [client/index.js][index_js]

   - Publishes [information topics using MQTT](#mqtt-topic-structure)
   - Web server, for displaying MQTT data pages (described below)
   - Read and Control GPIO pins on a Raspberry Pi (Switch, LEDs)

 - [client/public/index.html][index_html]

   Displays a [scrolling chart](#temperature-chart) of MQTT temperature data streaming from Raspberry Pi using Javascript
   - Uses MQTT over WebSockets + a Javascript graphing library

 - [client/public/dashboard.html][dashboard_html]

   Displays real-time status ["dashboard"](#dashboard) for multiple Pis using Javascript.
   - Uses web technologies like WebSockets and SVG. Uses MQTT (over WS) for realtime updates.

For the MQTT Broker used in this demo, see [PI_PREP.md](../info/PI_PREP.md#pi-mqtt-broker-using-mosquitto). Can run broker on same Pi as client.

## Getting Started With A Client Pi

Assuming [requirements](#requirements) are met, you can get a copy of the code by cloning git repository from GitHub:

``` sh
git clone https://github.com/idcrook/rpi-iot-demo-2017.git iot-demo
```

Edit `create-config.js` script to match your environment. It has values for broker name/WS port.

``` bash
cd iot-demo
cd client
npm install
./create-config.js
node index.js
```

If everything is working, can visit URL to view `index.html` ( e.g., http://client:3000 ) for a "real-time" graph of the Pi temperatures. Your browser must support WebSockets for graphing to work-- most modern ones do.



[index_js]: https://github.com/idcrook/rpi-iot-demo-2017/blob/master/client/index.js
[index_html]: https://github.com/idcrook/rpi-iot-demo-2017/blob/master/client/public/index.html
[dashboard_html]: https://github.com/idcrook/rpi-iot-demo-2017/blob/master/client/public/dashboard.html
