var socket;
var leftX = 100;
var leftY;
var rightX = 900;
var rightY;
var ballX;
var ballY;
var ballVelocityX;
var ballVelocityY;
var side;

function setup() {
  var cnv = createCanvas(1000, 800);
  frameRate(20);
  
  background(51);

  socket = io.connect('http://192.168.0.108:3000');
  socket.on('mouse', getOpponentLocation);
  socket.on('side', pickSide);
  socket.on('start', startGame);
}

function pickSide(data) {
  console.log(data);
  side = data;
}  

function startGame(data) {
  ballVelocityX = data.vx;
  ballVelocityY = data.vy;
  ballX = data.x;
  ballY = data.y;
}

function getOpponentLocation(data) {
  if (side == 'left') rightY = data.y;
  else leftY = data.y;
}

function mouseMoved() {
  var data = {
    y: mouseY
  };

  socket.emit('mouse', data);
}

function draw() {
  background(51);
  if (side=='left') leftY = mouseY;
  else rightY = mouseY;
  
  rect(leftX, leftY-40, 30, 80); //rihgt player racket 
  rect(rightX, rightY-40, 30, 80); // left player racket
  rect(ballX-5, ballY-5, 10, 10);
  ballX += ballVelocityX;
  ballY += ballVelocityY;
  if (ballY < 0 || ballY > 800) {
    ballVelocityY = -ballVelocityY; //ball hits wall
  }
  if (ballX > rightX && ballY > rightY-40 && ballY < rightY+40) {
    ballVelocityX = -ballVelocityX; // right player hits ball
  }
  if (ballX < leftX && ballY > leftY-40 && ballY < leftY+40) {
    ballVelocityX = -ballVelocityX; // left player hits ball
  }
  
}