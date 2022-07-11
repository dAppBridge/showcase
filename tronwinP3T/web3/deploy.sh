#!/bin/sh

sudo cp -R "/Users/danfield/Google Drive File Stream/My Drive/my stuff/df.nosync/tron/tronwinP3T/web3/" /Library/WebServer/Documents/
sudo chmod -R 444 /Library/WebServer/Documents/
sudo find /Library/WebServer/Documents/ -type d -exec chmod 755 {} \;
