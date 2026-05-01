// Sapce Battle
// Abdullah Abdelshafi 
// 4/22/2026
//
// Extra for Experts:
// - Sound Effects
// - Best Score from same browser (local) 
// - Searched how the computer can follow the player 
// - Used null which isnt the same as just unknown; 
//    found out that null is something you intentionally want it to be unknown searched and used vedo to find out what it meant when I saw it before 


// Variables 
let player;
let enemies = [];
let bullets = [];
let boss = null;
let gameState = "menu";
let score = 0;
let bestScore = 0;
let difficulty = "normal";
let menuBackground;
let playBackground;
let startTime;
let totalTime = 60;


// Players Class (You)
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.speed = 5;
  }

  // WASD movement with telportations
  move() {
    if (keyIsDown(65)){
      this.x -= this.speed; 
    }
    if (keyIsDown(68)) {
      this.x += this.speed; 
    }
    if (keyIsDown(87)) {
      this.y -= this.speed;
    } 
    if (keyIsDown(83)) {
      this.y += this.speed; 
    }

    //  Telportation
    if (this.x + this.radius < 0) {
      this.x += width;
    }
    if (this.x - this.radius > width) {
      this.x -= width;
    }
    if (this.y + this.radius < 0) {
      this.y += height;
    }
    if (this.y - this.radius > height) {
      this.y -= height;
    }
  }

  display() {
    fill(255);
    circle(this.x, this.y, this.radius);
  }
}


// Enemy Class (Computer)
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 3);
    this.width = 20;
    this.height = 20;
  }

  // Computer Following You
  follow(player) {
    this.x += (player.x - this.x) * 0.01 * this.speed;
    this.y += (player.y - this.y) * 0.01 * this.speed;
  }

  display() {
    fill(255, 60, 60);
    rect(this.x, this.y, this.width, this.height);
  }
}


// Bigger Enemy (more shots to kill)
class Boss {
  constructor() {
    this.x = width / 2;
    this.y = 100;
    this.health = 200;
    this.width = 60;
    this.height = 60;
  }

  move(player) {
    this.x += (player.x - this.x) * 0.05;
  }

  display() {
    fill(200, 0, 200);
    rect(this.x, this.y, this.width, this.height);
    // Writing 
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text("BOSS", this.x + 30, this.y + 35);
  }
}


// Shots that the you shot 
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 7;
    this.width = 5;
    this.height = 10;
  }

  move() {
    this.y -= this.speed;
  }

  display() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }
}


function preload(){
  menuBackground = loadImage("menu.jpg");
  playBackground = loadImage("background.jpg");
  // music = loadSound()
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  
  player = new Player(width / 2, height / 2);

  // Getting the best score 
  let saved = getItem("bestScore");
  if (saved !== 0){
    bestScore = saved;
  }
  // music.loop(); music.setVolume(0.5);
}


// Draws everything
function draw() {
  if (gameState === "menu"){
    image(menuBackground, 0, 0, width, height);
    menuScreen();
  } 
  else if (gameState === "play"){
    image(playBackground, 0, 0, width, height);
    gameScreen();
  } 
  else if (gameState === "gameover"){
    gameOverScreen();
  } 
  else if (gameState === "totutorial"){
    image(playBackground, 0, 0, width, height);
    howScreen();
  } 
}


// Menu Screen
function menuScreen() {
  textAlign(CENTER);
  fill(255);
  
  textSize(40);
  text("Reflex Arena", width / 2, height / 3);
  
  textSize(20);
  text("1 Easy | 2 Normal | 3 Hard | 4 Totutorial", width / 2, height / 1.35);
}


// Totutorial screen
function howScreen() {
  textAlign(CENTER);
  fill(255);
  textSize(30);
  text("How To Play", width / 2, 150);
  textSize(18);
}


// Inside the gameScreen
function gameScreen() {
  let timeLeft = totalTime - (millis() - startTime) / 1000;
  
  player.move();
  player.display();

  // Spawn enemies seeing if each frame count and spawns new
  if (frameCount % spawnRate() === 0) {
    enemies.push(new Enemy(random(width), random(height)));
  }

  // Spawn boss once when you get to a certian time
  if (timeLeft < 30 && boss === null) {
    boss = new Boss();
  }

  //  Normal enemies
  for (let e of enemies) {
    e.follow(player);
    e.display();

    // Checks the distance bettwen you and the enimies
    if (dist(player.x, player.y, e.x, e.y) < 20) {
      endGame();
    }
  }

  // Bullets moveing and displaying
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].move();
    bullets[i].display();
    
    // Checks the distance between the bullets and the enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (dist(bullets[i].x, bullets[i].y, enemies[j].x, enemies[j].y) < 15) {
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        score += 20;
        break;
      }
    }
  }

  // Boss showing and displaying
  if (boss) {
    boss.move(player);
    boss.display();
    
    // checks distance between you and boss
    if (dist(player.x, player.y, boss.x, boss.y) < 40) {
      endGame();
    }
    
    // checks distance between bullets and boss
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (dist(bullets[i].x, bullets[i].y, boss.x, boss.y) < 40) {
        boss.health -= 5;
        bullets.splice(i, 1);
      }
    }
    
    // checks if boss is dead
    if (boss.health <= 0) {
      score += 500;
      boss = null;
    }
  }

  // updating the game

  score++;
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 70, 20);
  text("Time:" + floor(timeLeft), 70, 40);
  // if (music && !music.isPlaying()) music.loop();

  if (timeLeft <= 0) {
    score--;
    endGame();
  }
}

  
// How fast the Particles spawn
function spawnRate() {
  if (difficulty === "easy"){
    return 120;
  } 
  if (difficulty === "normal"){
    return 80;
  } 
  if (difficulty === "hard"){
    return 50;
  } 
}


// Game over screen
function gameOverScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(40);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(20);
  text("Score: " + score, width / 2, height / 2);
  text("Best: " + bestScore, width / 2, height / 2 + 30);
  text("Press R to Restart", width / 2, height / 2 + 80);
}


function endGame() {
  gameState = "gameover";
  if (score > bestScore) {
    bestScore = score;
    storeItem("bestScore", bestScore);
  }
  // if (music) music.stop();
}


// When keys are pressed to go back to a certian area
function keyPressed() {
  if (gameState === "menu") {
    if (key === "1"){
      startGame("easy");
    } 
    if (key === "2"){
      startGame("normal");
    }
    if (key === "3"){
      startGame("hard");
    }
    if (key === "4"){
      gameState = "totutorial";
    }
  }
  // Keys not to go to a specific mode
  if (gameState === "totutorial" && key === "m") {
    gameState = "menu";
  }

  if (gameState === "play" && key === " ") {
    bullets.push(new Bullet(player.x, player.y));
  }

  if (gameState === "gameover" && key === "r") {
    gameState = "menu";
  }
}


// Seeing the diffulty mode and seeting up the game
function startGame(mode) {
  difficulty = mode;
  gameState = "play";

  enemies = [];
  bullets = [];
  boss = null;

  startTime = millis();
  score = 0;
}
