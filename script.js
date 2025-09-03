const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PADDLE_MARGIN = 16;
const PLAYER_COLOR = "#3af";
const AI_COLOR = "#f33";
const BALL_COLOR = "#fff";
const NET_COLOR = "#fff";
const NET_WIDTH = 4;
const NET_SEGMENT = 20;
const NET_GAP = 15;
const FPS = 60;

// Paddle objects
const player = {
  x: PADDLE_MARGIN,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: PLAYER_COLOR
};

const ai = {
  x: canvas.width - PADDLE_WIDTH - PADDLE_MARGIN,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: AI_COLOR,
  speed: 5
};

// Ball object
const ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speed: 6,
  velocityX: 6,
  velocityY: 2
};

// Listen for mouse movement to control left paddle
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height / 2;

  // Clamp paddle inside canvas
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Draw functions
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  for (let y = 0; y < canvas.height; y += NET_SEGMENT + NET_GAP) {
    drawRect(canvas.width / 2 - NET_WIDTH / 2, y, NET_WIDTH, NET_SEGMENT, NET_COLOR);
  }
}

// Collision detection
function collision(b, p) {
  return (
    b.x < p.x + p.width &&
    b.x + b.size > p.x &&
    b.y < p.y + p.height &&
    b.y + b.size > p.y
  );
}

// Reset ball to center
function resetBall() {
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  // Randomize starting direction
  ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.velocityY = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
}

// Update game objects
function update() {
  // Ball movement
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Ball collision with top/bottom
  if (ball.y <= 0) {
    ball.y = 0;
    ball.velocityY *= -1;
  }
  if (ball.y + ball.size >= canvas.height) {
    ball.y = canvas.height - ball.size;
    ball.velocityY *= -1;
  }

  // Ball collision with player paddle
  if (collision(ball, player)) {
    ball.x = player.x + player.width;
    ball.velocityX *= -1;
    // Add a bit of randomness depending on where the ball hits
    let collidePoint = (ball.y + ball.size / 2) - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    ball.velocityY = ball.speed * collidePoint;
  }

  // Ball collision with AI paddle
  if (collision(ball, ai)) {
    ball.x = ai.x - ball.size;
    ball.velocityX *= -1;
    let collidePoint = (ball.y + ball.size / 2) - (ai.y + ai.height / 2);
    collidePoint = collidePoint / (ai.height / 2);
    ball.velocityY = ball.speed * collidePoint;
  }

  // Ball out of bounds (left or right)
  if (ball.x < 0 || ball.x + ball.size > canvas.width) {
    resetBall();
  }

  // AI paddle movement (simple tracking)
  let aiCenter = ai.y + ai.height / 2;
  if (aiCenter < ball.y + ball.size / 2 - 10) {
    ai.y += ai.speed;
  } else if (aiCenter > ball.y + ball.size / 2 + 10) {
    ai.y -= ai.speed;
  }
  // Clamp AI paddle inside canvas
  if (ai.y < 0) ai.y = 0;
  if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Draw everything
function render() {
  // Clear canvas
  drawRect(0, 0, canvas.width, canvas.height, "#222");

  drawNet();

  // Draw paddles
  drawRect(player.x, player.y, player.width, player.height, player.color);
  drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

  // Draw ball
  drawRect(ball.x, ball.y, ball.size, ball.size, BALL_COLOR);
}

// Game loop
function game() {
  update();
  render();
  requestAnimationFrame(game);
}

resetBall();
game();