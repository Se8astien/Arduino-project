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

//Arduino board connection

var board = new five.Board();
board.on("ready", function() {
    console.log('Arduino connected');
    led = new five.Led(13);

});

//Socket connection handler
io.on('connection', function (socket) {
        console.log('socket id : '+socket.id);

        var temperature = new five.Thermometer({
          controller: "TMP36",
          pin: "A0"
        });

        temperature.on("change", function() {
          console.log(this.celsius + "°C", this.fahrenheit + "°F");
          socket.emit('temperature', { some: this.celsius });
        });
        socket.on('led:on', function (data) {
           led.on();
           console.log('LED ON RECEIVED'+temperature.celsius);
        });

        socket.on('led:off', function (data) {
            led.off();
            console.log('LED OFF RECEIVED');

        });

});





console.log('Waiting for connection');
