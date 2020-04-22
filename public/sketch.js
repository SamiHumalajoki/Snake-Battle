// Socket.IO:n asiakaspuolen olio, jota käytetään palvelimeen yhteyden-
// ottoon ja viestien välittämiseen.
let socket;
// Pelaajan madon x- ja y-koordinaatit.
let x;
let y;
// Pelaajan madon kasvunopeudet ruutuina x- ja y-koordinaattien suhteen.
// Sallitut arvot ovat -1, 0 ja 1.
let vx = 1;
let vy = 0;
// Pelaajan ja vastustajan pisteet.
let myScore = 0;
let opponentScore = 0;
// Pelaajan ja vastustajan matoja kuvaavat taulukot, joihin tallenetaan
// kaikki x- ja y-koordinaatit pelin edetessä.
let mySnake = [];
let opponentSnake = [];
// Erän numero. Erä päättyy aina jomman kumman madon törmäykseen.
let roundNumber = 0;
// Luku, jota käytetään erän lähtölaskentaan (3, 2, 1, 0).
let countdownValue;
// Tätä muuttujaa käytetään seuraamaan aikaa, joka on kulunut siitä 
// pelaajan matoa on edellisen kerran kasvatettu. 
let timeCount;

// Pelin piirtoalueen leveys ja korkeus, yksittäisen ruudun koko, tulostaulun
// korkeus, oletus-fonttikoko sekä lähtölaskenta-animaation pienimmän ja suurimman 
// fontin koko. Kaikki koot ovat pikseleinä ja ne määrätään setSizes()-metodin avulla.
 
let canvasWidth;
let canvasHeight;
let blockSize;
let scoreboardHeight;
let messageFontSize;
let countDownFontMin;
let countDownFontMax;

// Aika millisekunneissa, jonka jälkeen pelaajan matoa aina kasvatetaan.
const moveInterval = 100;
// Pelialueen ruudukon koko ruutuina leveys- ja korkeussuunnassa.
const gridSize = 50
// Pelialueen väri harmaasävynä välillä 0-255.
const backgroundColor = 50;

// Nämä vakiot edustavat kaikkia mahdollisia näkymiä 
const OPENING_VIEW = 1;
const WAITIN_FOR_OPPONENT_VIEW = 2;
const COUNTDOWN_VIEW = 3;
const GAME_VIEW = 4;
const GAME_OVER_VIEW = 5;
const OPPONENT_HAS_LEFT_VIEW = 6;
// Tämän hetkinen näkymä, jolla voi siis olla kuusi eri vaihtoehtoa. 
let currentView = OPENING_VIEW;

// P5.js-kehyksen funktio, jota kutsutaan aina ensimmäisenä, kun ohjelma
// käynnistetään. 
function setup() {
  setSizes();
//  P5.js-kehyksen funktio, jolla luodan uusi piirtopohja.
  createCanvas(canvasWidth, canvasHeight);
// Socket.IO-kehyksen olio, joka alustetaan kehykseen kuuluvalla io()-metodilla.
// Tämä metodi huolehtii yhteyden muodostamisesta palvelimeen, joka on siis
// oletuksena se palvelin, josta sivu on ladattu.  
  socket = io();
// Socket.IO-kehyksen on()-metodilla määritetään se funktio, jota kutsutaan aina
// kun parametrina annettu viesti (eventName) tulee palvelimelta.
// Peli alkaa, kun palvelimelta tulee 'startGame'-viesti.
  socket.on('startGame', () => {
    startGame();
  });

  socket.on('stopGame', () => {
    currentView = OPPONENT_HAS_LEFT_VIEW;
  });
// Kun palvelimelta saapuu 'move'-viesti ja sen mukana koordinaatteja 
// kuvaavaa dataa, se lisätään vastustajan matoa vastaavaan taulukkoon.
  socket.on('move', (data) => {
    opponentSnake.push({x: data.x, y:data.y});
  });
// Vastustajan aloituspaikkaa saadaan tällä viestillä.
  socket.on('initialSnake', (data) => {
    opponentSnake = data;
  });
// Vastustajan törmäys saadaan 'hit'-viestillä. Omaa pistemäärää kasvatetaan
// yhdellä ja lähetetään viesti 'readyToStart', mikäli ei olla vielä voitettu
// peliä. Muutoin siirrytään 'GAME_OVER_VIEW'-näkymään.
  socket.on('hit', () => {
    myScore++;
    if (myScore < 5) {
      socket.emit('readyToStart');
   }
  else {
    roundNumber = 0;
    currentView = GAME_OVER_VIEW;
  }
  });
}

// P5.js-kehyksen funktio, jota kutsutaan aina, kun jotakin nappia
// painetaan
function keyPressed() {
// Mikäli peli on käynnissä (GAME_VIEW) tai alkamassa (COUNDOWN_VIEW) madon
// kasvusuuntaa muokataan nuolinäppäimien mukaisesti.
  if (currentView === GAME_VIEW || currentView === COUNTDOWN_VIEW) {
    if (keyCode === LEFT_ARROW && vx !== 1) {
      vx = -1;
      vy = 0;
    }
    if (keyCode === RIGHT_ARROW && vx !== -1) {
      vx = 1;
      vy = 0;
    }
    if (keyCode === UP_ARROW && vy !== 1) {
      vx = 0;
      vy = -1;
    }
    if (keyCode === DOWN_ARROW && vy !== -1) {
      vx = 0;
      vy = 1;
    }
  }
// Mikäli ohjelma on juuri aloitettu tai peli on päättynyt (GAME_OVER_VIEW)
// tai vastustaja on katkaissut yhteyden (OPPONENT_HAS_LEFT_VIEW) siirrytään
// odottamaan vastustajaa (WAITING_FOR_OPPONENT_VIEW) ja nollataan pisteet
// ja eränumero ja ilmoitetaan palvelimelle, että ollaan valmiita aloittamaan.
  if (currentView === OPENING_VIEW || currentView === GAME_OVER_VIEW || 
      currentView === OPPONENT_HAS_LEFT_VIEW) {
    currentView = WAITIN_FOR_OPPONENT_VIEW;
    myScore = 0;
    opponentScore = 0;
    roundNumber = 0;
    socket.emit('readyToStart');
  }
}
// Pelin (erän) aloitus-funktio, jota kutsutaan vain kun palvelin on lähettänyt 
// 'startGame'viestin.
function startGame() {
  roundNumber++;
  opponentSnake = [];
  mySnake = [];
// P5.js-kehyksen funktio joka tyhjentää koko piirtoalueen ja täyttää
// sen parametrinaan saamalla värillä
  background(backgroundColor);
// Arvotaan pelaajan aloituspaikka ruudukossa, lisätään pelaaja ensimmäinen
// ruutu ja asetetaan 
  x = round(random(gridSize));
  y = round(random(gridSize));
  mySnake[0] = {x:x, y: y};
  countdownValue = 3;
// millis() on p5.js-kehyksen funktio, jolla saadaan järjestelmän aika milli-
// sekunteina. timeCount-muuttuja alustetaan järjestelmän ajalla, jotta
// voidaan päivittää aloitusanimaatio COUNTDOWN_VIEW-näkymässä.
  timeCount = millis();
// Lähetetään tieto omasta aloitussijainnista, jotta palvelin voi lähettää
// sen vastustajalle.
  socket.emit('initialSnake', mySnake);
  currentView = COUNTDOWN_VIEW;
}

// Tätä funktiota kutsutaan vain kerran ja se asettaa kaikki kokoihin liittyvät
// muuttujat perustuen käyttäjän ikkunan kokoon.
function setSizes() {
  canvasHeight = windowHeight < windowWidth? 0.9 * windowHeight: 0.9 * windowWidth;
  canvasWidth = 0.8 * canvasHeight;
  scoreboardHeight = 0.2 * canvasHeight;
  messageFontSize = 0.04 * canvasHeight;
  blockSize = canvasWidth / gridSize
  countDownFontMin = 0.08 * canvasHeight;
  countDownFontMax = 0.4 * canvasHeight;
}

// P5.js-kehyksen funktio, jota kutsutaan ohjelman ollessa käynnissä uudestaan
// ja uudestaan. Pelin pääsilmukka, joka vain kutsuu tämän hetkisen näkymän
// mukaista piirtometodia.
function draw() {
  switch(currentView) {
    case GAME_VIEW: 
      drawGameView();
      break;
    case COUNTDOWN_VIEW:
      drawCountdownView();
      break;
    case OPENING_VIEW:
      drawOpeningView();
      break;
    case WAITIN_FOR_OPPONENT_VIEW:
      drawWaitingForOpponentView();
      break;
    case GAME_OVER_VIEW:
      drawGameOverView();
      break;
    case OPPONENT_HAS_LEFT_VIEW:
      drawOpponentHasLeftView(); 
  } 
}

// Aloitusnäkymä
function drawOpeningView() {
  background(backgroundColor);
  fill(color(255));
  textSize(countDownFontMin);
  textAlign(CENTER, CENTER);
  text('SNAKE BATTLE', 0.5 * canvasWidth, 0.3 * canvasHeight);
  textSize(messageFontSize);
  text('control the', 0.15 * canvasWidth, 0.6 * canvasHeight);
  fill(color('yellow'));
  text('yellow', 0.36 * canvasWidth, 0.6 * canvasHeight); 
  fill(color('white'));
  text('snake with arrow keys', 0.7 * canvasWidth, 0.6 * canvasHeight);
  text('press any key to start the game', 0.5 * canvasWidth, 0.8 * canvasHeight);
}

// Metodi, joka piirtää näkymän, kun peli on käynnissä. Metodi myös päivittää
// matojen paikat ja tarkistaa, onko pelaajan mato törmännyt.

function drawGameView() {
// pelaajan madon tilaa päivitetään vain jos riittavä aika on kulunut edellisestä
// päivityksestä ja jos pelaajan mato on korkeintaan yhden ruudun verran pitempi,
// kuin vastustajan mato.
  if ( timeCount + moveInterval < millis() && 
      mySnake.length < opponentSnake.length + 2) {
    // tyhjennetään piirtoalue
    background(backgroundColor);
    // piirretään tulostaulu yläosaan
    drawScoreboardView();
    // 'nollataan' aikalaskuri
    timeCount = millis();
// päivitetään tämän hetkinen sijainti
    x += vx;
    y += vy;
// Tarkistetaan, onko oma mato edennyt johonkin ruutuun, joka jo löytyy omasta
// tai vastustajan madosta.
    if (opponentSnake.find(block => (x === block.x && y === block.y)) ||
        mySnake.find((block, index) => (index < mySnake.length - 1 && x === block.x && y === block.y))) {
// mikäli osuma tulee lähetetään palvelimelle 'hit'-viesti ja vastustajan
// pisteitä kasvatetaan yhdellä. Mikäli vastustajan pisteet ovat alle viisi 
// lähetetään palvelimelle 'readyToStart'-viesti, jotta uusi erä voidaan
// aloittaa, muutoin siirrytään GAME_OVER_VIEW-näkymään.
      socket.emit('hit');
      opponentScore++;
      if (opponentScore < 5) {
          socket.emit('readyToStart');
      }
      else {
        currentView = GAME_OVER_VIEW;
        roundNumber = 0;
      }
    }
// Mikäli pelaajan mato menee pelialueen reunan yli, mato tulee
// vastakkaiselta puolelta näkyviin.
    if (x > gridSize) {x = 0;}
    if (x < 0) {x = gridSize;}
    if (y > gridSize) {y = 0;}
    if (y < 0) {y = gridSize;}
// Lisätään nykyinen sijainti pelaajan mato-taulukkoon ja lähetetään 'move'-
// viesti palvelimelle, jotta se voi välittää uuden ruudun sijainnin
// vastustajalle.
    mySnake.push({x: x, y: y});
    socket.emit('move', {x:x, y: y});
// Kutsutaan varsinaista matojen piirto-metodia.
    drawSnakes();
  }
}

function drawSnakes() {
  fill(color('yellow'));
  mySnake.forEach(block => {
    rect(block.x * blockSize, block.y * blockSize + scoreboardHeight, blockSize, blockSize);
  });

  if(opponentSnake.length > 0) {
    fill(color('red'));
    opponentSnake.forEach(block => {
      rect(block.x * blockSize, block.y * blockSize + scoreboardHeight, blockSize, blockSize);
    });
  }
}

// Pelin (erän) käynnistyessä näytettävä animaatio, jonka aikana myös
// vastustajan mato on näkyvissä ja oman madon liikkeen suuntaan
// voi vaikuttaa nuolinäppäimillä. 
function drawCountdownView() {
  // tyhjennetään piirtoalue
  background(backgroundColor);
  // Piirretään tulosruutu piirtoalueen yläosaan
  drawScoreboardView();
// Asetetaan pelaajan matoon toinen ruutu madon liikkeen mukaan.
  mySnake[1] = {x: x + vx, y: y + vy};
  // piirretään molemmat madot näkyviin.
  drawSnakes();
  // Päivitetään lähtölaskennan lukua ja lähetetään uudelleen pelaajan madon sijainti
  // palvelimelle (sillä se on voinut muuttua) mikäli sekunti on kulunut.
  if (timeCount + 1000 < millis()) {
    timeCount = millis();
    countdownValue--;
    socket.emit('initialSnake', mySnake);
  }
//    Varsinainen lähtölaskenta-animaatio. //

  // p5.js-kehyksen funktio, jolla asetetaan teksti kohdistetaan keskelle.
  textAlign(CENTER, CENTER);
  // fill() on p5.js-kehyksen funktio, jolla valitaan piirtoväri (valkoinen).
  fill(color(255));
  // p5.js-kehyksen funktio, jolla asetetaan tekstin koko.
  textSize(countDownFontMin);
  // Piirretään koko teksti vain jos lähtölaskenta on 3, 2 tai 1
  if (countdownValue > 0) {
  // p5.js-kehyksen funktio, jolla piirretään tekstiä haluttuun paikkaan.
    text(`Round ${roundNumber} will start in`, 0.5 * canvasWidth, 0.3 * canvasHeight);
  }
  // Asetetaan tekstin harmaasävy lineaarisesti sekunnin kuluessa välillä 100 - 255. 
  fill(color(100 + ((millis() - timeCount) / 1000) * 155));
  // Asetetaan tekstin koko lineaarisesti sekunnin kuluessa välillä countDownFontMin -
  // countDownFontMax. 
  textSize(countDownFontMin + ((millis() - timeCount) / 1000) * (countDownFontMax - countDownFontMin));
  if (countdownValue > 0) {
    text(countdownValue.toString(), 0.5 * canvasWidth, 0.6 * canvasHeight);
  }
  // Piirretään vain 'GO!' kun ollaan saavutettu lähtölaskentaluku 0.
  else {
    text('GO!', 0.5 * canvasWidth, 0.6 * canvasHeight);
  }
  // Siirrytään GAME_VIEW-näkymään, kun on saavutettu lähtölaskentaluku -1.
  if (countdownValue === -1) {
    currentView = GAME_VIEW;
    background(backgroundColor);
  }
}

function drawWaitingForOpponentView() {
  background(backgroundColor);
  fill(color(255));
  textAlign(CENTER, CENTER);
  textSize(messageFontSize);
  text('Waiting for an opponent to join the game', 
    0.5 * canvasWidth, 0.5 * canvasHeight);
}

function drawOpponentHasLeftView() {
  background(backgroundColor);
  fill(color(255));
  textAlign(CENTER, CENTER);
  textSize(messageFontSize);
  text('Your opponent has left the game', 0.5 * canvasWidth, 0.5 * canvasHeight);
  text('press any key to start a new game', 0.5 * canvasWidth, 0.9 * canvasHeight);
}

function drawScoreboardView() {
  fill(color(100));
  rect(0, 0, canvasWidth, scoreboardHeight);
  textSize(scoreboardHeight / 2);
  fill(color('yellow'));
  text(myScore.toString(),  0.4 * canvasWidth, scoreboardHeight / 2);
  fill(color('white'));
  text('-', 0.5 * canvasWidth, scoreboardHeight / 2);
  fill(color('red'));
  text(opponentScore.toString(), 0.6 * canvasWidth, scoreboardHeight / 2);
}

function drawGameOverView() {
  background(backgroundColor);
  drawScoreboardView();
  fill(255);
  textSize(0.15 * canvasWidth);
  textAlign(CENTER, CENTER);
  text('Game over', 0.5 * canvasWidth, 0.5 * canvasHeight);
  if (myScore > opponentScore) {
    text('You won', 0.5 * canvasWidth, 0.7 * canvasHeight);
  }
  else {
    text('You lost', 0.5 * canvasWidth, 0.7 * canvasHeight);
  }
  textSize(messageFontSize);
  text('press any key to start a new game', 0.5 * canvasWidth, 0.9 * canvasHeight);
}