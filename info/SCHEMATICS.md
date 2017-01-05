
# Hardware Setup

Description of the hardware and electrical circuits used in the demo.

There are [Fritzing](http://fritzing.org/home/) files that also have editable versions of the design:

 - Download [Sketch_1_-_no_HW_debounce.fzz](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_no_HW_debounce.fzz)
 - Download [Sketch_1_-_with_HW_debounce.fzz](https://github.com/idcrook/rpi-iot-demo-2017/raw/master/info/Sketch_1_-_with_HW_debounce.fzz)

A "debounce" circuit allows better reliability for determining switch presses. It is simple to add on to an existing circuit.

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



## Wiring Diagram

TBD


## Add Debounce Circuit

TBD
