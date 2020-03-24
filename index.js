const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  })
  socket.on('mouse', (data) => {
    console.log(data);
    socket.broadcast.emit('mouse', data);
  })
});