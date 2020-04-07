let socket;
let vx = 1;
let vy = 0;
let blockSize;
let x;
let y;
let id = 0;
let gridSize = 50
let myScore = 0;
let opponentScore = 0;
let mySnake = [];
let opponentSnake = [];
let countdownValue;
let timeCount;
let moveInterval = 100;
let backgroundColor = 50;
let canvasWidth;
let canvasHeight;
let scoreboardHeight;
let messageFontSize;
let countDownFontMin;
let countDownFontMax;
let roundNumber = 0;

const OPENING_VIEW = 1;
const WAITIN_FOR_OPPONENT_VIEW = 2;
const COUNTDOWN_VIEW = 3;
const GAME_VIEW = 4;
const GAME_OVER_VIEW = 5;
const OPPONENT_HAS_LEFT_VIEW = 6;
let currentView = OPENING_VIEW;

function setup() {
  setSizes();
  createCanvas(canvasWidth, canvasHeight);
  socket = io();
  socket.on('startGame', () => {
    startGame();
  });
  socket.on('stopGame', () => {
    currentView = OPPONENT_HAS_LEFT_VIEW;
  });
  socket.on('move', (data) => {
    opponentSnake.push({x: data.x, y:data.y, id:data.id});
  });
  socket.on('initialSnake', (data) => {
    opponentSnake = data;
  });
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

function keyPressed() {
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
  if (currentView === OPENING_VIEW || currentView === GAME_OVER_VIEW || currentView === OPPONENT_HAS_LEFT_VIEW) {
    currentView = WAITIN_FOR_OPPONENT_VIEW;
    myScore = 0;
    opponentScore = 0;
    roundNumber = 0;
    socket.emit('readyToStart');
  }
}

function startGame() {
  roundNumber++;
  opponentSnake = [];
  mySnake = [];
  background(backgroundColor);
  id = 0;
  x = round(random(gridSize));
  y = round(random(gridSize));
  mySnake[0] = {x:x, y: y, id: id};
  countdownValue = 3;
  timeCount = millis();
  currentView = COUNTDOWN_VIEW;
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

function drawGameView() {
  if ( timeCount + moveInterval < millis() && 
      mySnake.length < opponentSnake.length + 1) {
    background(backgroundColor);
    drawScoreboardView();
    timeCount = millis();
    x += vx;
    y += vy;
    if (opponentSnake.find(block => (x === block.x && y === block.y)) ||
        mySnake.find((block, index) => (index < mySnake.length - 1 && x === block.x && y === block.y))) {
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
    if (x > gridSize) {x = 0;}
    if (x < 0) {x = gridSize;}
    if (y > gridSize) {y = 0;}
    if (y < 0) {y = gridSize;}

    mySnake.push({x: x, y: y});
    id++;
    socket.emit('move', {x:x, y: y, id: id});
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
}

function drawCountdownView() {
  background(backgroundColor);
  drawScoreboardView();
  mySnake[1] = {x: x + vx, y: y + vy, id: id};
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
  if (timeCount + 1000 < millis()) {
    timeCount = millis();
    countdownValue--;
    socket.emit('initialSnake', mySnake);
  }
  textAlign(CENTER, CENTER);
  fill(color(255));
  textSize(countDownFontMin);
  if (countdownValue > 0) {
    text(`Round ${roundNumber} will start in`, 0.5 * canvasWidth, 0.3 * canvasHeight);
  }
  fill(color(100 + ((millis() - timeCount) / 1000) * 155));
  textSize(countDownFontMin + ((millis() - timeCount) / 1000) * (countDownFontMax - countDownFontMin));
  if (countdownValue > 0) {
    text(countdownValue.toString(), 0.5 * canvasWidth, 0.6 * canvasHeight);
  }
  else {
    text('GO!', 0.5 * canvasWidth, 0.6 * canvasHeight);
  }
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
    canvasWidth / 2, canvasHeight / 2);
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