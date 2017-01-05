#!/bin/bash -x

# requires csshX to be installed on macOS
#     brew install csshx
#
# scripts convertDHCPClients.pl was used to generate suitable ~/.ssh/config

csshX  --ssh_args "-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" pi@demo-rpi[2-10]
