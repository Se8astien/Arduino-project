// server.js
var express        = require('express');
var app            = express();
var httpServer = require("http").createServer(app);
var five = require("johnny-five");
var io=require('socket.io')(httpServer);
var fs = require('fs');
var path = require('path');

var spawn = require('child_process').spawn;
var proc;
var sockets = {};

var port = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
        res.sendFile(__dirname + '/public/index.html');
});

httpServer.listen(port);
console.log('Server available at http://localhost:' + port);

var led;
var servo;
var tempSensor;
var oldtemp;
var socket;
//Arduino board connection

var board = new five.Board();

board.on("ready", function() {
    console.log('Arduino connected');

    led        = new five.Led(13);

    tempSensor = new five.Thermometer({
      controller: "TMP36",
      pin: "A0"
    });

    // servo      = new five.Servo({
    //   pin :10,
    //   center: true,
    // });

    //Socket connection handler
    io.on('connection', function (socket) {
            sockets[socket.id] = socket;
            console.log('socket id : '+socket.id);
            console.log("Total clients connected : ", Object.keys(sockets).length);


            socket.on('disconnect', function() {
                delete sockets[socket.id];

                // no more sockets, kill the stream
                if (Object.keys(sockets).length == 0) {
                  app.set('watchingFile', false);
                  if (proc) proc.kill();
                  fs.unwatchFile('./public/image_stream.jpg');
                }
              });

              socket.on('start-stream', function() {
                startStreaming(io);
              });

            tempSensor.on('data', function() {
              // if temp change then send data
              if(this.celsius != oldtemp){
                console.log(this.celsius + "°C", this.fahrenheit + "°F");

                socket.emit('tempSensor', { some: this.celsius });
                socket.broadcast.emit('tempSensor', { some: this.celsius });

              }
              oldtemp = this.celsius;
            });

            socket.on('led:on', function (data) {
               led.on();
               console.log('LED ON RECEIVED');
               socket.broadcast.emit('ledState', { state: "Led ON "});
               socket.emit('ledState', { state: "Led ON "});
            });

            socket.on('led:off', function (data) {
                led.off();
                console.log('LED OFF RECEIVED');
                socket.broadcast.emit('ledState', { state: "Led OFF "});
                socket.emit('ledState', { state: "Led OFF "});
            });

            // control servo
            // socket.on('servo:max90', function (data) {
            //     console.log('servo add 20');
            //     servo.to(90, 2000, 10);
            //     //servo.to(20);
            // });
            // socket.on('servo:min90', function (data) {
            //     console.log('servo go to -90');
            //   servo.to(-90, 2000, 10);
            //     //servo.to(-20);
            // });
            // socket.on('servo:center', function (data) {
            //     console.log('servo center');
            //     servo.to(45, 2000, 10);
            //     //servo.to(-20);
            // });


    });


});

function stopStreaming() {
  if (Object.keys(sockets).length == 0) {
    app.set('watchingFile', false);
    if (proc) proc.kill();
    fs.unwatchFile('./public/image_stream.jpg');
  }
}

function startStreaming(io) {

  if (app.get('watchingFile')) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    return;
  }

  var args = ["-w", "640", "-h", "480", "-o", "./public/image_stream.jpg", "-t", "999999999", "-tl", "100"];
  proc = spawn('raspistill', args);

  console.log('Watching for changes...');

  app.set('watchingFile', true);

  fs.watchFile('./public/image_stream.jpg', function(current, previous) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
  })

}


console.log('Waiting for connection');
