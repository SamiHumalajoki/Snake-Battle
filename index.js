// Express otetaan käyttöön requirella ja luomalla sovellus:
const express = require('express');
const app = express();
// 
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

var player1 = {id:undefined, readyToStart: false};
var player2 = {id:undefined, readyToStart: false};

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(express.static('public'))

io.on('connection', (socket) => {
  if (player1.id === undefined) {
    console.log(`${socket.id} connected as player 1`);
    player1.id = socket.id;
  }
  else if (player2.id === undefined) {
    console.log(`${socket.id} connected as player 2`);
    player2.id = socket.id;
  }

  socket.on('readyToStart', () => {
    if (player1.id === socket.id) {
      player1.readyToStart = true;
      if (player2.readyToStart) {
        player1.readyToStart = false;
        player2.readyToStart = false;
        io.emit('startGame');
      }
    }
    if (player2.id === socket.id) {
      player2.readyToStart = true;
      if (player1.readyToStart) {
        player1.readyToStart = false;
        player2.readyToStart = false;
        io.emit('startGame');
      }
    }
  })

  socket.on('hit', () => {
    socket.broadcast.emit('hit');
    player1.readyToStart = false;
    player2.readyToStart = false;
  })

  socket.on('initialSnake', (data) => {
    socket.broadcast.emit('initialSnake', data);
  })
 
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
    if (socket.id === player1.id) {
      console.log(`player 1 left the game`);
      player1.id = undefined;
      io.emit('stopGame');
    }
    if (socket.id === player2.id) {
      console.log(`player 2 left the game`);
      player2.id = undefined;
      io.emit('stopGame');
    }
  })
  socket.on('move', (data) => {
    socket.broadcast.emit('move', data);
  })
});