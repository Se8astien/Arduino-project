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


});

board.on("ready", function() {
    console.log('Arduino connected');

});




console.log('Waiting for connection');
