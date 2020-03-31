let socket;
let opponentX;
let opponentY;
let vx = 1;
let vy = 0;
let blockSize = 10;
let x;
let y;
let gridSizeX = 50;
let gridSizeY = 50;
let gameOn = false;
let gameOver = false;
let waitingForOpponent = true;
let myScore = 0;
let opponentScore = 0;
let mySnake = [];
let opponentSnake = [];
let startSequence = -1;
let timeCount;
let moveInterval = 100;
let fontSize = 50;

function setup() {
  textSize(fontSize);
  createCanvas(gridSizeX * blockSize, gridSizeY * blockSize);
  socket = io();
  socket.on('startGame', () => {
    console.log('game started');
    startGame();
  });
  socket.on('stopGame', () => {
    console.log('game ended');
    gameOn = false;
  });
  socket.on('move', (data) => {
    opponentSnake.push({x: data.x, y:data.y});
    opponentX = data.x;
    opponentY = data.y;
  });
  socket.on('hit', () => {
    console.log('opponent hit');
    myScore++;
    startGame();
  })
}

function keyPressed() {
  //console.log(keyCode);
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

function startGame() {
  opponentSnake = [];
  mySnake = [];
  background(51);
  x = round(random(10,40)) * blockSize;
  y = round(random(10,40)) * blockSize;
  gameOn = false;
  startSequence = 3;
  timeCount = millis();
}
//
function draw() {
  if (gameOn && timeCount + moveInterval < millis() && mySnake.length < opponentSnake.length + 1) {
    timeCount = millis();
    x += vx * blockSize;
    y += vy * blockSize;
    if (opponentSnake.find(block => (x === block.x && y === block.y)) ||
        mySnake.find((block, index) => (index < mySnake.length - 1 && x === block.x && y === block.y))) {
          socket.emit('hit');
          opponentScore++;
          console.log('hit');
          startGame();
        } 
    mySnake.push({x: x, y: y});
    //console.log(`x: ${x}, y:${y}`);
    socket.emit('move', {x:x, y: y});
    fill(color('red'));
    rect(x, y, blockSize, blockSize);
    if(opponentX) {
      fill(color('white'));
      rect(opponentX, opponentY, blockSize, blockSize);
    }
  }
  if (startSequence !== -1) {
    if (timeCount + 1000 < millis()) {
      timeCount = millis();
      startSequence--;
      console.log(startSequence);
    }
    background(51);
    fill(color(255));
    textSize(fontSize);
    text(startSequence.toString(), 250, 250);
    if (startSequence === -1) {
      gameOn = true;
      background(51);
    } 
  }
}
