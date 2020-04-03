const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

var player1;
var player2;

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(express.static('public'))

io.on('connection', (socket) => {
  if (player1 === undefined) {
    console.log(`${socket.id} connected as player 1`);
    player1 = socket.id;
    if (player2 !== undefined) {
      io.emit('startGame');
    }
  }
  else if (player2 === undefined) {
    console.log(`${socket.id} connected as player 2`);
    player2 = socket.id;
    if (player1 !== undefined) {
      io.emit('startGame');
    }
  }

  socket.on('ready', () => {
    socket.broadcast.emit('ready');
  })

  socket.on('hit', () => {
    socket.broadcast.emit('hit');
  })
 
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
    if (socket.id === player1) {
      console.log(`player 1 left the game`);
      player1 = undefined;
      io.emit('stopGame');
    }
    if (socket.id === player2) {
      console.log(`player 2 left the game`);
      player2 = undefined;
      io.emit('stopGame');
    }
  })
  socket.on('move', (data) => {
    //console.log(data);
    socket.broadcast.emit('move', data);
  })
});