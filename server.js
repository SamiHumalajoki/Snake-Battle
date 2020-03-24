'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 80;
const INDEX = path.join(__dirname, 'index.html');
const SKETCH = path.join(__dirname, 'sketch.js');

const server = express()
  .use((req, res) => {res.sendFile(INDEX); res.sendFile(SKETCH);} )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);
/*
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
*/
/////////////////////////////////

var leftId;
var rightId;

io.sockets.on('connection', newConnection);

function newConnection(socket) {
	socket.join('room1');
	if (leftId==null) {
		leftId = socket.id;
    	console.log('left player: ' + leftId);
    	socket.emit('side', 'left');
    }
    else {
    	rightId = socket.id;
    	console.log('right player: ' + rightId);
    	socket.emit('side', 'right');
    	data = {
    		x: 500,
    		y: 500,
    		vy: 2,
    		vx: 10
    	};
    	//io.sockets.emit('start', data);
    	io.to('room1').emit('start', data);
    }

    socket.on('disconnect', function(){
    	console.log('user ' + socket.id + ' disconnected');
    });

    socket.on('mouse', mouseMsg);

    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        //console.log(data);
    }
}
