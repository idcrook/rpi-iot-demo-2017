# Reveal.js MQTT plugin

Simple MQTT plugin for [reveal.js](https://github.com/hakimel/reveal.js) (framework for easily creating beautiful presentations using HTML).

![Image of mqtt-reveal.js](https://github.com/roccomuso/reveal.js-mqtt-plugin/blob/master/slide-example.PNG)

# Installation

Place the mqtt directory within the reveal.js plugin directory - that's it. Tested with version 3.2.0 of reveal.js.

# Usage

**With this plugin you can easily integrate MQTT data within reveal.js**.

After copying the 'mqtt' directory into the reveal.js 'plugins' directory, you also need to add this dependency to your ***Reveal.initialize*** script (which you will normally find at the end of your HTML file).

```html
<script>
    Reveal.initialize({

        // ... add your other settings here ...

		mqtt_broker: '192.168.1.111', // Broker address
		mqtt_port: '3000', // MQTT over Web Socket port
		mqtt_username: '', // username [optional]
		mqtt_password: '', // username [optional]

        // Optional reveal.js plugins
        dependencies: [
            // other dependencies ...

            // add THIS dependencies for MQTT plugin
            { src: 'plugin/mqtt/mqttws31.js', async: true },
			{ src: 'plugin/mqtt/mqtt.js', async: true }

        ]
    });

</script>
```

Make sure to put the right mqtt_broker address and port. (The port needed must be the one for the WebSocket not the bare mqtt protocol one, 1883).

After that, in the slides-section of your HTML, just create a section for your next slide. Add a mqtt attribute to your section.
**Every <code>span</code> element inside the mqtt section defines a topic.**
You can filter incoming JSON data defining the <code>json-field</code> attribute. That field will be shown when data comes from the MQTT broker.
You can also specify for the <code>span</code> element an optional attribute for QoS: <code>mqtt-qos</code> with a number between 0 and 2, (default: 0).

```html
<!-- Example of MQTT real-time temperature -->
<section mqtt>
	<h1>Temperature:</h1>
	<h2>
		<span json-field="temperature">
			livingroom/sensor/A
		</span> °
	</h2>
</section>
```

Without the <code>json-field</code> attribute, the raw data will be printed as it is with no JSON parsing and filtering.

```html
<!-- Example of MQTT raw data printing -->
<section mqtt>
	<h1>Incoming raw data:</h1>
	<h2>
		<span>bedroom/sensor/B</span>
	</h2>
	<h2>
		<span>another/topic/C</span>
	</h2>
</section>
```

# CSS

I personally like this color for the retrieved topics data. Just add this to your CSS template:

```css
/*********************************************
 * MQTT data styling
 *********************************************/
section[mqtt] span {
  padding-left: 0.15em;
  padding-right: 0.15em;
  color: #7E7EEA;
}
```


# Credits

Writter by **Rocco Musolino** for reveal.js

Website: [hackerstribe.com](http://www.hackerstribe.com)

Thanks to the [Paho Project](https://eclipse.org/paho/clients/js/) for the beautiful JS MQTT library (mqttws31.js).

## License

MIT