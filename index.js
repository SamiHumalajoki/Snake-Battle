// Express otetaan käyttöön requirella ja luomalla sovellus:
const express = require('express');
const app = express();
// Luodaan palvelinsovellus.
const http = require('http').createServer(app);
// Liitetään Socket.IO-kehyksen palvelinpuolen ohjelmakirjasto
// luotuun palvelinsovellukseen.
const io = require('socket.io')(http);
// Asetetaan PORT joko 3000 tai palvelinkoneen määräämään ympäristömuutuujan
// arvoon.
const PORT = process.env.PORT || 3000;
// Pelaajien soketteja vastaavat muuttujat. Oletuksena kumpikaan pelaaja ei ole
// valmis aloittamaan peliä.
var player1 = {id:undefined, readyToStart: false};
var player2 = {id:undefined, readyToStart: false};

// Laitetann palvelinsovellus kuuntelemaan porttia PORT.
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Annetaan asiakkaan käyttöön kaikki public-kansion tiedostot.
app.use(express.static('public'))

// Määritellään toimenpiteet, kun asikas ottaa soketilla yhteyden palvelimeen.
io.on('connection', (socket) => {
  // Mikäli player1- tai player2-muuttuja on määrittelemättä, asetetaan
  // soketin tunnus muuttujan arvoksi.
  if (player1.id === undefined) {
    console.log(`${socket.id} connected as player 1`);
    player1.id = socket.id;
  }
  else if (player2.id === undefined) {
    console.log(`${socket.id} connected as player 2`);
    player2.id = socket.id;
  }
  // Seuraavaksi määritellään kaikki toimenpiteet eri soketilta tulleille
  // viesteille
  //
  // Kun vastaanotetaan 'readyToStart'-viesti, niin lähetetään 'startGame'-viesti
  // mikäli molemmat pelaajat ovat valmiina.
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
 
  // Mikäli jompikumpi pelaaja katkaisee yhteyden, niin lähetetään
  // 'stopGame'-viesti toiselle pelaajalle ja pelaajan paikka vapautetaan.
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