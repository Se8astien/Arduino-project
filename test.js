// server.js
var express        = require('express');
var app            = express();
var httpServer = require("http").createServer(app);
var five = require("johnny-five");
var io=require('socket.io')(httpServer);

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
var connected=false;

//Socket connection handler
io.on('connection', function (s) {
        socket = s;
        connected = true;

        console.log('socket id : '+socket.id);

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
        socket.on('servo:max90', function (data) {
            console.log('servo add 20');
            servo.to(90, 2000, 10);
            //servo.to(20);
        });
        socket.on('servo:min90', function (data) {
            console.log('servo go to -90');
          servo.to(-90, 2000, 10);
            //servo.to(-20);
        });
        socket.on('servo:center', function (data) {
            console.log('servo center');
        servo.to(45, 2000, 10);
            //servo.to(-20);
        });

});

board.on("ready", function() {
    console.log('Arduino connected');
    led        = new five.Led(13);
    servo      = new five.Servo({
      startAt: 45,
      pin :10
    });
    tempSensor = new five.Thermometer({
      controller: "TMP36",
      pin: "A0"
    });

  
});




console.log('Waiting for connection');
