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

  socket = io.connect("https://samis-pong.herokuapp.com/");
  socket.on('mouse', (data) => {
    if (side == 'left') rightY = data.y;
    if (side == 'right') leftY = data.y;
  });

  socket.on('side', (data) => {
    console.log(data);
    side = data;
  }  
  socket.on('start', sync);
  socket.on('hit', sync);
}

function sync(data) {
  console.log("started");
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
  let data = {
    y: ballY,
    x: ballX,
    vx: ballVelocityX;
    vy: ballVelocityY
  }
  if (side=='left') {
    leftY = mouseY;
    // left player hits ball
    if (ballX < leftX) {
      if (ballY > leftY-40 && ballY < leftY+40) {
        ballVelocityX = -ballVelocityX; 
        socket.emit('hit',data);
      }
      else socket.emit('miss');
  if (side=='right') {
    rightY = mouseY;
    // right player hits ball
    if (ballX > rightX) {
      if (ballY > rightY-40 && ballY < rightY+40) {
        ballVelocityX = -ballVelocityX;
        socket.emit('hit',data);
      }
      else socket.emit('miss');
  }

  
  rect(leftX, leftY-40, 30, 80); //rihgt player racket 
  rect(rightX, rightY-40, 30, 80); // left player racket
  rect(ballX-5, ballY-5, 10, 10);
  ballX += ballVelocityX;
  ballY += ballVelocityY;
  //ball hits wall
  if (ballY < 0 || ballY > 800) {
    ballVelocityY = -ballVelocityY; 
  } 
}
