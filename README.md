# Arduino-project Raspberry PI 2

https://www.codetutorial.io/nodejs-socket-io-and-jhonny-five-to-control-arduino/

first install node.js http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/


curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs

then install :

npm install johnny-five raspi-io
npm install express
npm install socket.io
npm install bower

goto bower directory and install :

bower install angularjs --save
bower install socket.io-client --save
bower install angular-socket-io --save


then launch :
node test.js
