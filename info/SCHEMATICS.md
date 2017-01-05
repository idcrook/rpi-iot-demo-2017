
# Hardware Setup

Description of the hardware and electrical circuits used in the demo. It consists of LEDs driven by GPIO pins from the Pi as well as a Pi-readable switch. A "mini-breadboard" is used to be able to wire up the circuit elements.

A "debounce" circuit allows better reliability for determining switch presses. To add hardware debounce circuitry to a switch circuit is relatively simple.

There are [breadboard](#wiring-diagrams) and [electrical schematic](#electrical-schematic-diagrams) views included.

[Fritzing](http://fritzing.org/home/) files have editable versions of the design:

 - Download [Sketch_1_-_no_HW_debounce.fzz](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_no_HW_debounce.fzz)
 - Download [Sketch_1_-_with_HW_debounce.fzz](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_with_HW_debounce.fzz)


![][bb_overview]

## Parts list

See [SPECS.md](SPECS.md) for any further component details.

Need:

 - Raspberry Pi, Power Supply, Ethernet cable, and mini-breadboard
 - Wires that can connect to header pins on Pi and breadboard

LEDs and Switch hardware

| Quantity | Component           | Description |
| :-----:  | -----               | -----       |
| 2        | 330 **Ω** Resistor  | LED Current limiters |
| 2        | 3mm PTH LED         |   one red, one green |
| 1        | 5mm tactile switch  |  breadboard friendly |
| &nbsp;   |                     |                      |
| _optional_ |  _Debounce circuitry_ | _For switch_     |
| 1        | 10 **kΩ** resistor  |             |
| 1        | 100 **nF** capacitor |             |



## Wiring Diagrams

### Simplest Circuit

![][bb_wiring_main]

![][bb_wiring_sw1]


### Add Debounce Circuit

LEDs are the same.

![][bb_wiring_main]

Rewire a capacitor and resistor into the switch circuit as a hardware "debounce" circuit.

![][bb_wiring_sw2]


## Electrical schematic diagrams


### No debounce circuit

![][schem_no_debounce]

### With Debounce circuit

![][schem_with_debounce]

<!-- footnote links -->

[bb_overview]:         https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_with_HW_debounce_bb.png
[bb_wiring_main]:      https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Wire_BB_Main.png
[bb_wiring_sw1]:       https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Wire_BB_Switch1.png
[bb_wiring_sw2]:       https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Wire_BB_Switch2.png
[schem_no_debounce]:   https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_no_HW_debounce_schem.png
[schem_with_debounce]: https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_with_HW_debounce_schem.png
