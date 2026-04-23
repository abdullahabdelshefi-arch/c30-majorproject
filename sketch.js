// Reaction time Major Project
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
let timer = 60;
let difficulty = "normal";
let menuBackground;
let playBackground;

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
    fill(0, 200, 255);
    circle(this.x, this.y, this.size);
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
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  if (gameState === "menu"){
    menuScreen();
  } 
  else if (gameState === "play"){
    gameScreen();
  } 
  else if (gameState === "gameover"){
    gameOverScreen();
  } 
  else if (gameState === "totutorial"){
    howScreen();
  } 

}
