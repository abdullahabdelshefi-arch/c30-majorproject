
// Sapce Battle
// Abdullah Abdelshafi
// 4/22/2026
//
// Extra for Experts:
// making a system in hard mode rather then just follwing player it will try to trap him nice to have "ai system"/ will not be all moving toghther toward you 


// Variables
let player;
let enemies = [];
let bullets = [];
let boss = null;
let gameState = "menu";
let score = 0;
let bestScore = 0;
let difficulty = "normal";

let totalTime = 60;
let tutorialStep = 0;
let tutorialTimer = 0;
let startTime;
let lastShot = 0;
let shootCooldown = 600;

let menuBackground;
let playBackground;
let spaceShip;
let alienShip;
let shootSound;
let deathSound;
let music;

let wave = 1;
let enemiesKilled = 0;
let enemiesPerWave = 10;
let bossSpawned = false;
let enemiesThisWave = 0;
let maxWaves = 5;


function preload(){
  menuBackground = loadImage("menu.jpg");
  playBackground = loadImage("background.jpg");
  spaceShip = loadImage("space.png");
  alienShip =  loadImage("alienship.jpg");
  bossImage = loadImage("boss.png");

  // SOUND FILES
  shootSound = loadSound("shoot.mp3");
  deathSound = loadSound("death.mp3");
  music = loadSound("music.mp3");
}


// Players Class
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
    this.x = constrain(this.x, this.radius, width - this.radius);
    this.y = constrain(this.y, this.radius, height - this.radius);
  }
  display() {
    image(spaceShip, this.x - 25, this.y - 25, 55, 55);
  }
}


// Enemy Class
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    if (difficulty === "hard") {
      this.speed = random(1, 3) + wave * 0.2;
    }
    else {
      this.speed = random(1, 3);
    }
    this.width = 20;
    this.height = 20;
  }


  // Computer Following You
  follow(player) {
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let d = dist(this.x, this.y, player.x, player.y);

    if(difficulty !== "hard"){
      this.x += dx / d * this.speed;
      this.y += dy / d * this.speed;
    }
    
    else{
      let playerLastX;
      let playerLastY;

      
      // Player movement prediction
      let playerVelocityX = player.x - playerLastX;
      let playerVelocityY = player.y - playerLastY;

      // Predict future player location
      let futureX = player.x + playerVelocityX * 15;
      let futureY = player.y + playerVelocityY * 15;

      // Random behaviour style for enemies
      // Makes them feel alive instead of all doing same thing and getting mushed toghether
      let style = this.x % 3;

      // What to do in each type 
      if(style < 1){
        // Used chatgpt to understand the math I have to do and did it with code
        let huntDx = futureX - this.x;
        let huntDy = futureY - this.y;
        let huntD = dist(this.x, this.y, futureX, futureY);

        this.x += huntDx / huntD * this.speed * 1.4;
        this.y += huntDy / huntD * this.speed * 1.4;
      }
      // Side attackers
      else if (style < 2){
        let sideX = futureX + dy * 0.5;
        let sideY = futureY - dx * 0.5;

        let sideDx = sideX - this.x;
        let sideDy = sideY - this.y;
        let sideD = dist(this.x, this.y, sideX, sideY);

        this.x += sideDx / sideD * this.speed * 1.2;
        this.y += sideDy / sideD * this.speed * 1.2;
      }
      else{
        // Cuts off route of the player more random
        let trapX = player.x + playerVelocityX * 30;
        let trapY = player.y + playerVelocityY * 30;

        let trapDX = trapX - this.x;
        let trapDY = trapY - this.y;
        let trapD = dist(this.x, this.y, trapX, trapY);

        this.x += trapDX / trapD * this.speed;
        this.y += trapDY / trapD * this.speed;
      }
      
      // Boost to you when its close
      if (d < 150) {
        this.x += dx / d * this.speed * 0.8;
        this.y += dy / d * this.speed * 0.8;
      }
      
      // Brevent from stacking
      for (let other of enemies) {
        if (other !== this) {
          let space = dist(this.x, this.y, other.x, other.y);
          if (space < 40) {
            let pushX = this.x - other.x;
            let pushY = this.y - other.y;
            this.x += pushX * 0.03;
            this.y += pushY * 0.03;
          }
        }
      }
    }

    // telportation for hard and meduim
    if (difficulty === "normal" || difficulty === "hard") {
      if (this.x < 0){
        this.x = width;
      }
      if (this.x > width){
        this.x = 0;
      }
      if (this.y < 0){
        this.y = height;
      }
      if (this.y > height){
        this.y = 0;
      }
    }
  }
  display() {
    image(alienShip, this.x, this.y, this.width, this.height);
  }
}


// Bigger Enemy (more shots to kill)
class Boss {
  constructor() {
    this.x = 30;
    this.y = 100;
    this.health = 20;
    this.width = 60;
    this.height = 60;
  }

  move(player) {
    this.x += (player.x - this.x) * 0.04;
    this.y += (player.y - this.y) *0.04;
  }

  display() {
    image(bossImage,this.x,this.y,this.width,this.height);
  
    // Writing
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text("BOSS", this.x + 30, this.y + 35);
  }
}


// Sets the bullet class
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


function setup() {
  createCanvas(windowWidth, windowHeight);
 
  player = new Player(width / 2, height / 2);
  
  // Getting the best score
  let saved = getItem("bestScore");
  if (saved !== null){
    bestScore = saved;
  }
  
  // Music looping 
  music.loop();
  music.setVolume(0.3);

  playerLastX = width/2;
  playerLastY = height/2;
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
  // text
  fill(255);
  textAlign(CENTER);
  textSize(20);
  player.display();

  // STEP 1: Movement
  if (tutorialStep === 0) {
    text("Use WASD to move", width/2, 100);
    player.move();
    tutorialTimer++;
    if (tutorialTimer > 180) {
      tutorialStep = 1;
      tutorialTimer = 0;
      bullets = [];
    }
  }


  // STEP 2: Shooting
  else if (tutorialStep === 1) {
    text("Press SPACE to shoot", width/2, 100);
    // The bullets for the totutorial
    tutorialBullets();
    tutorialTimer++;
    if (tutorialTimer > 180) {
      tutorialStep = 2;
      tutorialTimer = 0;
      bullets = [];
    }
  }


  // STEP 3: Enemy example
  else if (tutorialStep === 2) {
    text("Press M To Return", width/2, 100);
    drawCooldownBar();
    if (frameCount % 100 === 0 && enemies.length < 5) {
      enemies.push(new Enemy(random(width), random(height)));
    }
    for (let e of enemies) {
      if(dist(e.x,e.y,player.x,player.y)>5){
        e.follow(player);
      }
      e.display();
    }
    player.move();
    
    // Bullets
    tutorialBullets();
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].move();
      bullets[i].display();
      // Remove off screen bullets
      if (bullets[i].y < 0) {
        bullets.splice(i, 1);
        continue;
      }
      // Kill tutorial enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (dist(bullets[i].x,bullets[i].y,enemies[j].x,enemies[j].y) < 20) {
          enemies.splice(j, 1);
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }
}


// Inside the gameScreen
function gameScreen() {
  let timeLeft = totalTime - (millis() - startTime) / 1000;
  
  player.move();
  player.display();

  // the 5 waves for each level 
  text("Wave: " + wave, 70, 60);
  if (frameCount % spawnRate() === 0 && enemiesThisWave < enemiesPerWave) {
    enemies.push(new Enemy(random(width), random(height)));
    enemiesThisWave++;
  }

  // Spawn boss once when you get to a certian time
  if (enemiesThisWave === enemiesPerWave && boss === null && maxWaves <= 5) {
    boss = new Boss();
  }

  // Normal enemies
  for (let e of enemies) {
    e.follow(player);
    e.display();

    // Checks the distance bettwen you and the enimies
    if (dist(player.x, player.y, e.x + 10, e.y + 10) < 25) {
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
        enemiesKilled++;
        break;
      }
    }
  }

  // Boss showing and displaying
  if (boss) {
    boss.move(player);
    boss.display();
    
    // Checking the distance between player and boss
    if (dist(player.x, player.y, boss.x, boss.y) < 30) {
      endGame();
    }

    // Checking the distance between bullets and boss
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (dist(bullets[i].x, bullets[i].y, boss.x + boss.width / 2, boss.y + boss.height / 2) < 40) {
        boss.health -= 5;
        bullets.splice(i, 1);
      }
    }
   
    if (boss.health <= 0) {
      score += 500;
      boss = null;
      wave++;
      enemiesThisWave = 0;
      bossSpawned = false;
      score += 200;
    }
  }


  // updating the game
  score++;
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 70, 20);
  text("Time:" + floor(timeLeft), 70, 40);
  if (timeLeft <= 0) {
    score--;
    endGame();
  }
  drawCooldownBar();
}


// How fast the enimies spawn
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
  deathSound.play();
  if (score > bestScore) {
    bestScore = score;
    storeItem("bestScore", bestScore);
  }
}


// Cool down bullets so you cant stand still and just shoot
function shootBullet() {
  if (millis() - lastShot > shootCooldown) {
    bullets.push(new Bullet(player.x, player.y));
    shootSound.play();
    lastShot = millis();
  }
}


// Bullets for the toutorial step
function tutorialBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].move();
    bullets[i].display();
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }
}

// Cooldown Bar
function drawCooldownBar() {
  let barWidth = 200;
  let barHeight = 20;
  let ready = constrain((millis() - lastShot) / shootCooldown,0,1);
  
  // Background
  fill(100);
  rect(width / 2 - 100, height - 40, barWidth, barHeight);
  
  // Filled part
  fill(0, 255, 100);
  rect(width / 2 - 100,height - 40, barWidth * ready, barHeight);
  
  fill(255);
  textSize(12);
  textAlign(CENTER);
  text("Bullet Cooldown", width / 2, height - 45);
}


// When keys are pressed to go back to a certian area
function keyPressed() {
  userStartAudio();

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
    tutorialStep = 0;
  }
  if (gameState === "play" && key === " ") {
    shootBullet();
  }
  if (gameState === "totutorial" && key === " ") {
    shootBullet();
  }
  if (gameState === "gameover" && key === "r") {
    gameState = "menu";
    enemiesThisWave = 0;
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
  
  wave = 1;
  enemiesKilled = 0;
  enemiesThisWave = 0;
}
