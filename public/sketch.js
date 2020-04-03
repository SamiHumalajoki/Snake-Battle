let socket;
let opponentX;
let opponentY;
let vx = 1;
let vy = 0;
let blockSize;
let x;
let y;
let id = 0;
let gridSize = 50
let gameOn = false;
let gameOver = false;
let waitingForOpponent = true;
let faultOccured = false;
let myScore = 0;
let opponentScore = 0;
let mySnake = [];
let opponentSnake = [];
let startSequence = -1;
let timeCount;
let moveInterval = 100;
let fontSize = 50;
let backgroundColor = 50;
let canvasWidth;
let canvasHeight;
let scoreboardHeight;
let messageFontSize;
let countDownFontMin;
let countDownFontMax;
let roundNumber;

const WAITIN_FOR_OPPONENT_VIEW = 1;
const COUNTDOWN_VIEW = 2;
const GAME_VIEW = 3;
const GAME_OVER_VIEW = 4;
let currentView = WAITIN_FOR_OPPONENT_VIEW;

function setup() {
  setSizes();
  textSize(fontSize);
  createCanvas(canvasWidth, canvasHeight);
  socket = io();
  socket.on('ready', () => {
    waitingForOpponent = false;
    gameOver
  });
  socket.on('startGame', () => {
    console.log('game started');
    roundNumber = 1;
    myScore = 0;
    opponentScore = 0;
    startGame();
  });
  socket.on('stopGame', () => {
    console.log('game ended');
    gameOn = false;
    faultOccured = true;
  });
  socket.on('move', (data) => {
    opponentSnake.push({x: data.x, y:data.y, id:data.id});
    opponentX = data.x;
    opponentY = data.y;
  });
  socket.on('hit', () => {
    console.log('opponent hit');
    myScore++;
    roundNumber++;
    if (myScore < 5) {
      startGame();
   }
  else {
    waitingForOpponent = true;
    gameOver = true;
    gameOn = false;
  }
  });
}

function keyPressed() {
  if (gameOn) {
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
  else {
    gameOver = false;
    socket.emit('ready');
  }
}

function startGame() {
  currentView = COUNTDOWN_VIEW;
  gameOn = false;
  gameOver = false;
  waitingForOpponent = false;
  faultOccured = false;
  opponentSnake = [];
  mySnake = [];
  background(backgroundColor);
  x = round(random(gridSize));
  y = round(random(gridSize));
  startSequence = 3;
  timeCount = millis();
}

function setSizes() {
  canvasHeight = windowHeight < windowWidth? 0.9 * windowHeight: 0.9 * windowWidth;
  canvasWidth = 0.8 * canvasHeight;
  scoreboardHeight = 0.2 * canvasHeight;
  messageFontSize = 0.04 * canvasHeight;
  blockSize = canvasWidth / gridSize
  countDownFontMin = 0.08 * canvasHeight;
  countDownFontMax = 0.4 * canvasHeight;
}

function draw() {
  drawscoreboardView();
  if (gameOn && timeCount + moveInterval < millis() && 
      mySnake.length < opponentSnake.length + 1) {
    drawGameView();
  }
  else {
    if (startSequence !== -1 && !waitingForOpponent) {
      drawCountdownView();
    }
    if (waitingForOpponent) {
      drawWaitingForOpponentView();
    }
    if (gameOver) {
      drawGameOverView();
    }
    if (faultOccured) {
      drawFaultOccuredView();
    }
  }
}

function drawGameView() {
  timeCount = millis();
  x += vx;
  y += vy;
  //console.log(opponentSnake);
  if (opponentSnake.find(block => (x === block.x && y === block.y)) ||
      mySnake.find((block, index) => (index < mySnake.length - 1 && x === block.x && y === block.y))) {
    socket.emit('hit');
    opponentScore++;
    roundNumber++;
    console.log('hit');
    if (opponentScore < 5) {
        startGame();
     }
    else {
      waitingForOpponent = true;
      gameOver = true;
      gameOn = false;
    }
  }
  if (x > gridSize) {x = 0;}
  if (x < 0) {x = gridSize;}
  if (y > gridSize) {y = 0;}
  if (y < 0) {y = gridSize;}

  mySnake.push({x: x, y: y});
  id++;
  //console.log(`x: ${x}, y:${y}`);
  socket.emit('move', {x:x, y: y, id: id});
  fill(color('yellow'));
  rect(x * blockSize, y * blockSize + scoreboardHeight, blockSize, blockSize);
  if(opponentX) {
    fill(color('red'));
    rect(opponentX * blockSize, opponentY * blockSize + scoreboardHeight, blockSize, blockSize);
  }
}

function drawCountdownView() {
  background(backgroundColor);
  drawscoreboardView();
  if (timeCount + 1000 < millis()) {
    timeCount = millis();
    startSequence--;
    console.log(startSequence);
  }
  textAlign(CENTER, CENTER);
  fill(color(255));
  textSize(countDownFontMin);
  text(`Round ${roundNumber} will start in`, 0.5 * canvasWidth, 0.3 * canvasHeight);
  textSize(countDownFontMax);
  text(startSequence.toString(), 0.5 * canvasWidth, 0.6 * canvasHeight);
  if (startSequence === -1) {
    gameOn = true;
    background(backgroundColor);
  }
}

function drawWaitingForOpponentView() {
  background(backgroundColor);
  fill(color(255));
  textAlign(CENTER, CENTER);
  textSize(messageFontSize);
  text('Waiting for an opponent to join the game', 
    canvasWidth / 2, canvasHeight / 2);
}

function drawFaultOccuredView() {
  background(backgroundColor);
  fill(color(255));
  textAlign(CENTER, CENTER);
  textSize(messageFontSize);
  text('Your opponent has left the game',
    canvasWidth / 2, canvasHeight / 2);
}

function drawscoreboardView() {
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
  drawscoreboardView();
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
  text('Press any key to start a new game', 0.5 * canvasWidth, 0.9 * canvasHeight);
}