# Specifications and Datasheets

where available


## LEDs

### 3mm discrete LED Red

Brand: Seeedstudio
Product Code: SEEED-LED116A1B

DISCONTINUED

### 3mm discrete LED Green

https://www.seeedstudio.com/3mm-LED-Green-25-PCs-p-1589.html

#### SPECIFICATIONS

 - Maximum Forward Current: 30mA
 - Maximum Reverse Voltage: 6V
 - Forward Voltage: 1.9V~2.6V (IF=20mA)
 - Reverse Current: 5uA
 - Luminous Intensity: 30~50mcd (IF=20mA)
 - Viewing Angel: 30deg
 - Wavelength: 568~573nm
 - Working Temperature: -55~+100°C
 - Storage Temperature: -55~+100°C
 - Soldering Temperature: 260°C for 5 seconds

#### Current limit calculations

These are just illustrative. Went with **330 Ω** as a "safe" choice, and the LED's are slightly dimmed...
A 5V supply _is_ available, but since we are using the 3.3V-safe GPIO pins to control the LEDs, we are going to use 3.3V supply.

##### V<sub>s</sub> == 3.3V

Supply voltage: 3.3V
I<sub>f</sub>: 10 mA
V<sub>f</sub>: ~2V

 1. V = IR
 1. R = V/I
 1. R ≈ (3.3V - 2V) / (10 mA)
 1. R ≈ 1.3 / 0.01
 1. R ≈ 130 Ω
