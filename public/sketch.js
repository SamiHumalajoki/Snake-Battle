
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

// Pelialueen väri harmaasävynä välillä 0-255.
const backgroundColor = 50;

// Nämä vakiot edustavat kaikkia mahdollisia pelin näkymiä 
const OPENING_VIEW = 1;
const WAITIN_FOR_OPPONENT_VIEW = 2;
const COUNTDOWN_VIEW = 3;
const GAME_VIEW = 4;
const GAME_OVER_VIEW = 5;
const OPPONENT_HAS_LEFT_VIEW = 6;

// Peli-olio, joka sisältää koko pelin ohjaukseen tarvittavat
// metodit ja muuttujat.
let game;

// P5.js-kehyksen funktio, jota kutsutaan aina ensimmäisenä, kun ohjelma
// käynnistetään. 
function setup() {
  // alustetaaan uusi peli-olio Game.js-tiedoston Game()-luokan avulla.
  game = new Game();
  game.timeCount = millis();
  setSizes();
//  P5.js-kehyksen funktio, jolla luodan uusi piirtopohja.
  createCanvas(canvasWidth, canvasHeight);
// Socket.IO-kehyksen olio, joka alustetaan kehykseen kuuluvalla io()-metodilla.
// Tämä metodi huolehtii yhteyden muodostamisesta palvelimeen, joka on siis
// oletuksena se palvelin, josta sivu on ladattu.
}


// P5.js-kehyksen funktio, jota kutsutaan aina, kun jotakin nappia
// painetaan
function keyPressed() {
// Mikäli peli on käynnissä (GAME_VIEW) tai alkamassa (COUNDOWN_VIEW) madon
// kasvusuuntaa muokataan nuolinäppäimien mukaisesti.
  if (game.currentView === GAME_VIEW || game.currentView === game.COUNTDOWN_VIEW) {
    if (keyCode === LEFT_ARROW && game.vx !== 1) {
      game.vx = -1;
      game.vy = 0;
    }
    if (keyCode === RIGHT_ARROW && game.vx !== -1) {
      game.vx = 1;
      game.vy = 0;
    }
    if (keyCode === UP_ARROW && game.vy !== 1) {
      game.vx = 0;
      game.vy = -1;
    }
    if (keyCode === DOWN_ARROW && game.vy !== -1) {
      game.vx = 0;
      game.vy = 1;
    }
  }
// Mikäli ohjelma on juuri aloitettu tai peli on päättynyt (GAME_OVER_VIEW)
// tai vastustaja on katkaissut yhteyden (OPPONENT_HAS_LEFT_VIEW) siirrytään
// odottamaan vastustajaa (WAITING_FOR_OPPONENT_VIEW) ja nollataan pisteet
// ja eränumero ja ilmoitetaan palvelimelle, että ollaan valmiita aloittamaan.
  if (game.currentView === OPENING_VIEW || game.currentView === GAME_OVER_VIEW || 
      game.currentView === game.OPPONENT_HAS_LEFT_VIEW) {
    game.currentView = WAITIN_FOR_OPPONENT_VIEW;
    game.myScore = 0;
    game.opponentScore = 0;
    game.roundNumber = 0;
    game.socket.emit('readyToStart');
  }
}

// Tätä funktiota kutsutaan vain kerran setup()-funktiosta ja se asettaa kaikki
// kokoihin liittyvät muuttujat perustuen käyttäjän ikkunan kokoon.
function setSizes() {
  canvasHeight = windowHeight < windowWidth? 0.9 * windowHeight: 0.9 * windowWidth;
  canvasWidth = 0.8 * canvasHeight;
  scoreboardHeight = 0.2 * canvasHeight;
  messageFontSize = 0.04 * canvasHeight;
  blockSize = canvasWidth / game.gridSize
  countDownFontMin = 0.08 * canvasHeight;
  countDownFontMax = 0.4 * canvasHeight;
}

// P5.js-kehyksen funktio, jota kutsutaan ohjelman ollessa käynnissä uudestaan
// ja uudestaan. Pelin pääsilmukka, joka vain kutsuu tämän hetkisen näkymän
// mukaista piirtometodia.
function draw() {
  
  switch(game.currentView) {
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
  if ( game.timeCount + moveInterval < millis() && 
      game.mySnake.length < game.opponentSnake.length + 2) {
    // tyhjennetään piirtoalue
    background(backgroundColor);
    // piirretään tulostaulu yläosaan
    drawScoreboardView();
    // 'nollataan' aikalaskuri
    game.timeCount = millis();
    game.gameUpdate();
// Kutsutaan varsinaista matojen piirto-metodia.
    drawSnakes();
  }
}

function drawSnakes() {
  fill(color('yellow'));
  game.mySnake.forEach(block => {
    rect(block.x * blockSize, block.y * blockSize + scoreboardHeight, blockSize, blockSize);
  });

  if(game.opponentSnake.length > 0) {
    fill(color('red'));
    game.opponentSnake.forEach(block => {
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
  game.mySnake[1] = {x: game.x + game.vx, y: game.y + game.vy};
  // piirretään molemmat madot näkyviin.
  drawSnakes();
  // Päivitetään lähtölaskennan lukua ja lähetetään uudelleen pelaajan madon sijainti
  // palvelimelle (sillä se on voinut muuttua) mikäli sekunti on kulunut.
  if (game.timeCount + 1000 < millis()) {
    game.timeCount = millis();
    game.countdownValue--;
    game.socket.emit('initialSnake', game.mySnake);
  }
//    Varsinainen lähtölaskenta-animaatio. //

  // p5.js-kehyksen funktio, jolla asetetaan teksti kohdistetaan keskelle.
  textAlign(CENTER, CENTER);
  // fill() on p5.js-kehyksen funktio, jolla valitaan piirtoväri (valkoinen).
  fill(color(255));
  // p5.js-kehyksen funktio, jolla asetetaan tekstin koko.
  textSize(countDownFontMin);
  // Piirretään koko teksti vain jos lähtölaskenta on 3, 2 tai 1
  if (game.countdownValue > 0) {
  // p5.js-kehyksen funktio, jolla piirretään tekstiä haluttuun paikkaan.
    text(`Round ${game.roundNumber} will start in`, 0.5 * canvasWidth, 0.3 * canvasHeight);
  }
  // Asetetaan tekstin harmaasävy lineaarisesti sekunnin kuluessa välillä 100 - 255. 
  fill(color(100 + ((millis() - game.timeCount) / 1000) * 155));
  // Asetetaan tekstin koko lineaarisesti sekunnin kuluessa välillä countDownFontMin -
  // countDownFontMax. 
  textSize(countDownFontMin + ((millis() - game.timeCount) / 1000) * (countDownFontMax - countDownFontMin));
  if (game.countdownValue > 0) {
    text(game.countdownValue.toString(), 0.5 * canvasWidth, 0.6 * canvasHeight);
  }
  // Piirretään vain 'GO!' kun ollaan saavutettu lähtölaskentaluku 0.
  else {
    text('GO!', 0.5 * canvasWidth, 0.6 * canvasHeight);
  }
  // Siirrytään GAME_VIEW-näkymään, kun on saavutettu lähtölaskentaluku -1.
  if (game.countdownValue === -1) {
    game.currentView = GAME_VIEW;
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
  text(game.myScore.toString(),  0.4 * canvasWidth, scoreboardHeight / 2);
  fill(color('white'));
  text('-', 0.5 * canvasWidth, scoreboardHeight / 2);
  fill(color('red'));
  text(game.opponentScore.toString(), 0.6 * canvasWidth, scoreboardHeight / 2);
}

function drawGameOverView() {
  background(backgroundColor);
  drawScoreboardView();
  fill(255);
  textSize(0.15 * canvasWidth);
  textAlign(CENTER, CENTER);
  text('Game over', 0.5 * canvasWidth, 0.5 * canvasHeight);
  if (game.myScore > game.opponentScore) {
    text('You won', 0.5 * canvasWidth, 0.7 * canvasHeight);
  }
  else {
    text('You lost', 0.5 * canvasWidth, 0.7 * canvasHeight);
  }
  textSize(messageFontSize);
  text('press any key to start a new game', 0.5 * canvasWidth, 0.9 * canvasHeight);
}
