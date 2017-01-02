
# Raspberry Pi Client Preparation

Assume Raspbian Jessie is already installed.

## GitHub repo

``` bash
git clone --origin github https://github.com/idcrook/rpi-iot-demo-2017.git iot-demo
```

## NVM

[NVM](https://github.com/creationix/nvm) (Node Version Manager) installs node.js.

	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
	nvm install stable
	nvm alias default  stable
	node --version

### Environment

`nvm` installs itself into `~/.bashrc`, which makes login prompt take a long time each login.
... so comment it out in `~/.bashrc`:

``` bash
#export NVM_DIR="/home/pi/.nvm"
#[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
```

and instead link directly `/usr/local/bin` to the version it just installed, e.g.

``` bash
sudo ln -s /home/pi/.nvm/versions/node/v7.3.0/bin/node /usr/local/bin/node
sudo ln -s /home/pi/.nvm/versions/node/v7.3.0/bin/npm /usr/local/bin/npm
```

to get `node` and `npm` in path.

## Turn off GUI login

You can get a lot more system memory and performance available  if you shut off the graphical desktop.

``` bash
sudo update-rc.d lightdm disable
systemctl get-default
sudo systemctl set-default multi-user.target
```

`raspi-config` utility can also do the `multi-user.target` thing.

## Optional Other Software

	sudo apt install -y sysbench htop

### sysbench

`sysbench` is a benchmark application.

	sysbench --test=cpu --cpu-max-prime=20000 run
	sysbench --test=cpu --num-threads=4  --cpu-max-prime=20000 run

It can be used to tax the CPU (and heat up the Pi SoC chip).


### WiringPi

[WiringPi](http://wiringpi.com) fortunately comes installed on the system in Raspbian Jessie.

	gpio -v
	gpio readall

### onoff

[onoff](https://github.com/fivdi/onoff): "GPIO access and interrupt detection with Node.js on Linux boards like the Raspberry Pi, C.H.I.P. or BeagleBone."

Installs with `npm` and is in `package.json`


# Pi MQTT Broker Using Mosquitto

Mosquitto is an MQTT Broker implementation in Python. The quad-core Raspberry Pi 2 or faster recommended.

## Install mosquitto

Install `mosquitto` MQTT broker server

``` bash
wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
sudo apt-key add mosquitto-repo.gpg.key
cd /etc/apt/sources.list.d/
sudo wget http://repo.mosquitto.org/debian/mosquitto-jessie.list
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients mosquitto-dbg python-mosquitto python3-mosquitto
```

## configure the daemon

See [config used](../conf/raspi-demo.conf). The WebSockets support is needed for real-time Web Browser access.

``` bash
sudo mkdir /etc/mosquitto/credentials
sudo mosquitto_passwd -c /etc/mosquitto/credentials/passwd pi
# provide a password at prompt, such as 'raspberry'
sudo service mosquitto restart
```

### test configuration

```bash
mosquitto_sub -v -t '$SYS/broker/uptime'
# <Ctrl-C> to exit

# being more explicit, and include user/passwords
mosquitto_sub -v -t '$SYS/broker/uptime' -h localhost -p 1883 -u pi -P raspberry
```
