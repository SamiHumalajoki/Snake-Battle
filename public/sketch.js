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
let mySnake = [];
let opponentSnake = [];
let startSequence = 0;
let timeCount;
let moveInterval = 500;

function setup() {
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
    startGame();
  })
}

function keyPressed() {
  console.log(keyCode);
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
  gameOn = true;
  timeCount = millis();
}

function draw() {
  if (gameOn && timeCount + moveInterval < millis() && mySnake.length < opponentSnake.length + 1) {
    timeCount = millis();
    x += vx * blockSize;
    y += vy * blockSize;
    if (opponentSnake.find(block => (x === block.x && y === block.y)) ||
        mySnake.find((block, index) => (index < mySnake.length - 1 && x === block.x && y === block.y))) {
          socket.emit('hit');
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
  else if (startSequence !== 0) {

  }
}
