// Testaamista varten sketch.js-tiedostosta luodaan olio
class Game {
  
  constructor(socket) {
      // Pelialueen ruudukon koko ruutuina leveys- ja korkeussuunnassa.
    this.gridSize = 50;
    // Nämä vakiot edustavat kaikkia mahdollisia näkymiä 
    this.OPENING_VIEW = 1;
    this.WAITIN_FOR_OPPONENT_VIEW = 2;
    this.COUNTDOWN_VIEW = 3;
    this.GAME_VIEW = 4;
    this.GAME_OVER_VIEW = 5;
    this.OPPONENT_HAS_LEFT_VIEW = 6;
    this.currentView = this.OPENING_VIEW;

    this.timeCount;
    
    // Socket.IO:n asiakaspuolen olio, jota käytetään palvelimeen yhteyden-
    // ottoon ja viestien välittämiseen.
    this.socket;
    // Pelaajan madon x- ja y-koordinaatit.
    this.x;
    this.y;
    // Pelaajan madon kasvunopeudet ruutuina x- ja y-koordinaattien suhteen.
    // Sallitut arvot ovat -1, 0 ja 1.
    this.vx = 1;
    this.vy = 0;
    // Pelaajan ja vastustajan pisteet.
    this.myScore = 0;
    this.opponentScore = 0;
    // Pelaajan ja vastustajan matoja kuvaavat taulukot, joihin tallenetaan
    // kaikki x- ja y-koordinaatit pelin edetessä.
    this.mySnake = [];
    this.opponentSnake = [];
    // Erän numero. Erä päättyy aina jomman kumman madon törmäykseen.
    this.roundNumber = 0;
    // Luku, jota käytetään erän lähtölaskentaan (3, 2, 1, 0).
    this.countdownValue;
    // Tätä muuttujaa käytetään seuraamaan aikaa, joka on kulunut siitä 
    // pelaajan matoa on edellisen kerran kasvatettu. 
    this.timeCount;
    this.socket = socket;
    this.setSocket();
  }

  setSocket() {
     // Socket.IO-kehyksen on()-metodilla määritetään se funktio, jota kutsutaan aina
  // kun parametrina annettu viesti (eventName) tulee palvelimelta.
  // Peli alkaa, kun palvelimelta tulee 'startGame'-viesti.
    this.socket.on('startGame', () => {
      this.startGame();
    });
  
    this.socket.on('stopGame', () => {
      this.currentView = this.OPPONENT_HAS_LEFT_VIEW;
    });
  // Kun palvelimelta saapuu 'move'-viesti ja sen mukana koordinaatteja 
  // kuvaavaa dataa, se lisätään vastustajan matoa vastaavaan taulukkoon.
    this.socket.on('move', (data) => {
      this.opponentSnake.push({x: data.x, y:data.y});
    });
  // Vastustajan aloituspaikkaa saadaan tällä viestillä.
    this.socket.on('initialSnake', (data) => {
      this.opponentSnake = data;
    });
  // Vastustajan törmäys saadaan 'hit'-viestillä. Omaa pistemäärää kasvatetaan
  // yhdellä ja lähetetään viesti 'readyToStart', mikäli ei olla vielä voitettu
  // peliä. Muutoin siirrytään 'GAME_OVER_VIEW'-näkymään.
    this.socket.on('hit', () => {
      this.myScore++;
      if (this.myScore < 5) {
        this.socket.emit('readyToStart');
     }
    else {
      this.roundNumber = 0;
      this.currentView = GAME_OVER_VIEW;
    }
    });
  }

// Pelin (erän) aloitus-funktio, jota kutsutaan vain kun palvelin on lähettänyt 
// 'startGame'viestin.

  startGame() {
    this.roundNumber++;
    this.opponentSnake = [];
    this.mySnake = [];
  // Arvotaan pelaajan aloituspaikka ruudukossa, lisätään pelaaja ensimmäinen
  // ruutu ja asetetaan 
    this.x = round(random(this.gridSize));
    this.y = round(random(this.gridSize));
    this.mySnake[0] = {x:this.x, y: this.y};
    this.countdownValue = 3;

  // Lähetetään tieto omasta aloitussijainnista, jotta palvelin voi lähettää
  // sen vastustajalle.
    this.socket.emit('initialSnake', this.mySnake);
    this.currentView = COUNTDOWN_VIEW;
  }

  gameUpdate() {
    // päivitetään tämän hetkinen sijainti
    this.x += this.vx;
    this.y += this.vy;
// Tarkistetaan, onko oma mato edennyt johonkin ruutuun, joka jo löytyy omasta
// tai vastustajan madosta.
    if (this.opponentSnake.find(block => (this.x === block.x && this.y === block.y)) ||
        this.mySnake.find((block, index) => (index < this.mySnake.length - 1 && this.x === block.x && this.y === block.y))) {
// mikäli osuma tulee lähetetään palvelimelle 'hit'-viesti ja vastustajan
// pisteitä kasvatetaan yhdellä. Mikäli vastustajan pisteet ovat alle viisi 
// lähetetään palvelimelle 'readyToStart'-viesti, jotta uusi erä voidaan
// aloittaa, muutoin siirrytään GAME_OVER_VIEW-näkymään.
      this.socket.emit('hit');
      this.opponentScore++;
      if (this.opponentScore < 5) {
          this.socket.emit('readyToStart');
      }
      else {
        this.currentView = GAME_OVER_VIEW;
        this.roundNumber = 0;
      }
    }
// Mikäli pelaajan mato menee pelialueen reunan yli, mato tulee
// vastakkaiselta puolelta näkyviin.
    if (this.x > this.gridSize) {this.x = 0;}
    if (this.x < 0) {this.x = this.gridSize;}
    if (this.y > this.gridSize) {this.y = 0;}
    if (this.y < 0) {this.y = thisgridSize;}
// Lisätään nykyinen sijainti pelaajan mato-taulukkoon ja lähetetään 'move'-
// viesti palvelimelle, jotta se voi välittää uuden ruudun sijainnin
// vastustajalle.
    this.mySnake.push({x: this.x, y: this.y});
    this.socket.emit('move', {x: this.x, y: this.y});
  }

}

module.exports = Game;