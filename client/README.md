

# MQTT demo client for Raspberry Pi

Javascript client (node.js) that reads internal temperatures on a Pi and [makes available using MQTT](#mqtt-topic-structure).
Also runs a webserver for displaying [charts](#temperature-chart) and [diagrams](#dashboard) on MQTT data.
Also talks to GPIO hardware on Pi, [reading switches and lighting LEDs](https://github.com/idcrook/rpi-iot-demo-2017/blob/master/client/index.js#L240-L273).

## Requirements

 - Raspberry Pi. - Tested with Raspbian jessie on Pi 2 and Pi B+ models
 - node.js - Tested with NVM, works well with latest Node (v7.3.0)
 - MQTT broker (server) on network, with WebSockets enabled
   - This demo tested using [mosquitto](https://mosquitto.org/) running on a Pi Model 2. Refer to [config used](../conf/raspi-demo.conf).

## Getting started

Get a copy by cloning from GitHub

``` sh
git clone https://github.com/idcrook/rpi-iot-demo-2017.git iot-demo
```

Edit the `create-config.js` script to match your environment. It has values for broker name/WS port.

``` bash
cd client
npm install
./create-config.js
node index.js
```

If everything is working, can visit URL ( http://example.com:3000 ) for a "real-time" graph of the Pi temperatures.

Browser must support WebSockets for it to work.  Most modern ones do.


### Temperature Chart

![](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/TemperatureChart_resize1.png)

## Implementation information

 - `client/index.js` Javascript (**node.js**)

   [Publishes information using MQTT](#mqtt-topic-structure)
   Serves webpages (described below) to display information from MQTT
   Reads and Controls GPIO pins on a Raspberry Pi

 - `client/public/index.html`

   Displays a [scrolling chart](#temperature-chart) of MQTT temperature data streaming from Raspberry Pi
   - Uses MQTT over WebSockets + a Javascript graphing library

 - `client/public/dashboard.html`

   Displays a ["dashboard"](#dashboard) for status and information from multiple Pis.
   - Uses MQTT over WebSockets, Client Javascript, and SVG technologies

## MQTT Topic Structure

PubSub topic structure being used in this demo

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

## Dashboard

`dashboard.html` served from the Pi uses an SVG to display a diagram of real-time information.

![](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/RasPi_IoT_Dashboard_animation.gif)
