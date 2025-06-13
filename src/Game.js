import TileMap from "./TileMap.js";

const tileSize = 32;
const velocity = 2;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileMap = new TileMap(tileSize);
const pacman = tileMap.getPacman(velocity);
const enemies = tileMap.getEnemies(velocity);

let gameOver = false;
let gameWin = false;
const gameOverSound = new Audio("sounds/gameOver.wav");
const gameWinSound = new Audio("sounds/gameWin.wav");
let score = 0;
window.score = score;

function gameLoop() {
  tileMap.draw(ctx);
  drawGameEnd();

  // Check for collision with enemies before drawing Pacman
  if (!pause()) {
    enemies.forEach(enemy => {
      if (!pacman.powerDotActive && enemy.collideWith(pacman)) {
        if (pacman.lives > 1) {
          pacman.loseLife();
          // Reset Pacman to start position (assuming startX/startY exist)
          pacman.x = pacman.startX;
          pacman.y = pacman.startY;
          pacman.currentMovingDirection = null;
          pacman.requestedMovingDirection = null;
        } else {
          pacman.loseLife();
          gameOver = true;
          gameOverSound.play();
        }
      }
    });
  }

  pacman.draw(ctx, pause(), enemies);
  enemies.forEach(enemy => enemy.draw(ctx, pause(), pacman));
  checkGameWin();

  // Update lives counter on screen
  document.getElementById("livesCounter").innerText = `Lives: ${pacman.lives}`;
  score = window.score;
  document.getElementById("scoreCounter").innerText = `Score: ${score}`;
}

function checkGameWin() {
  if (!gameWin) {
    gameWin = tileMap.didWin();
    if (gameWin) {
      gameWinSound.play();
    }
  }
}

function pause() {
  return !pacman.madeFirstMove || gameOver || gameWin;
}

function drawGameEnd() {
  if (gameOver || gameWin) {
    let text = "You Win!";
    if (gameOver) text = "Game Over";

    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height / 3.2, canvas.width, 120);

    ctx.font = "115px 'Press Start 2P'";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0.4", "yellow");
    gradient.addColorStop("0.7", "red");
    gradient.addColorStop("0.9", "white");

    ctx.fillStyle = gradient;
    const textWidth = ctx.measureText(text).width;
    const xPosition = canvas.width / 2 - textWidth / 2;
    ctx.fillText(text, xPosition, canvas.height / 2);

    // Add restart instructions
    ctx.font = "25px 'Press Start 2P'";
    ctx.fillStyle = "white";
    const restartText = "Press R to Restart";
    const restartWidth = ctx.measureText(restartText).width;
    ctx.fillText(restartText, canvas.width / 2 - restartWidth / 2, canvas.height / 2 + 50);
  }
}


tileMap.setCanvasSize(canvas);
setInterval(gameLoop, 1000 / 75);

document.addEventListener("keydown", (event) => {
  if ((gameOver || gameWin) && (event.key === "r" || event.key === "R")) {
    location.reload();
  }
});