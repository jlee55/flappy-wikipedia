let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles='

let userInput;

let counter = 0;
var socket;
var bird;
var pipes = [];

function setup() {
  createCanvas(400, 600);
  bird = new Bird();
  pipes.push(new Pipe());
  userInput = select('#userinput');
  // //starts searching if the user changes the term they are looking for
  userInput.changed(startSearch);

  socket = io.connect('http://localhost:3007');
  socket.on('space',newBird);
}

//wikipedia
//hey could you start searching this word 
function startSearch(){
  counter = 0;
  goWiki(userInput.value());
}

//uh ye sure this is how i'm going to make the url so the search function can understand
function goWiki(term){
    // let term = userInput.value();
    counter = counter +1;
    let url = searchUrl + term;
    loadJSON(url,gotSearch,'jsonp');
  }

//thanks but this is in human language 
//so i'm going to change it around a little bit for the content(actual search?) function 
function gotSearch(data){
  console.log(data);
  let len = data[1].length;
  let index = floor(random(len));
  let title = data[1][index];
  title = title.replace(/\s+/g, '_');
  createDiv(title);
  console.log('Querying:' + title);
  let url = contentUrl + title;
  loadJSON(url,gotContent,'jsonp');
}

//ok got it but going to throw a random search result for you just because 
function gotContent(data){
  let page = data.query.pages;
  let pageId = Object.keys(data.query.pages)[0];
  console.log(pageId);
  let content = page[pageId].revisions[0];
  console.log(content);
  let wordRegex = /\b\w{4, }\b/g;
  var words = content.match(wordRegex);
  var word = random(words);
  goWiki(word);
}
     
//flappy bird
//bird and pipes
function draw() {
  background(0);
  bird.update();
  bird.show();
//bird is hit,pipes go off screen, splice, etc etc 
  for (var i = pipes.length - 1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();
    if (pipes[i].hits(bird)) {
    }
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }
  if (frameCount % 100 === 0) {
    pipes.push(new Pipe());
  }
}

function newBird(birdy){
  bird.update();
  bird.show();
}

//spacebar
function keyPressed() {
  //what am I sending? location of x and y of the ellipse
   if (key == ' ') {
    bird.up();
  }
     socket.emit('space',birdy);

    var birdy = {
      x: 64,
      y: bird.height
    }  
 
}
         
//bird - the birds speed/gravity/velocity etc
function Bird() {
  this.y = height / 2;
  this.x = 64;

  this.gravity = 0.6;
  this.lift = -15;
  this.velocity = 0;

  this.show = function() {
    fill(255);
    ellipse(this.x, this.y, 32, 32);
  }

  this.up = function() {
    this.velocity += this.lift;
  }

  this.update = function() {
    this.velocity += this.gravity;
    this.velocity *= 0.9;
    this.y += this.velocity;

    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
}


//dem pipes - what is shown when the bird collides/what should be displayed when the bird collides
//what happens if the bird goes off screen etc etc 
function Pipe() {
  this.top = random(height / 2);
  this.bottom = random(height / 2);
  this.x = width;
  this.w = 20;
  this.speed = 2;

  this.collision = false;

  this.hits = function(bird) {
    if (bird.y < this.top || bird.y > height - this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        this.collision = true;
        return true;
      }
    }
    this.collision = false;
    return false;
  }

  this.show = function() {
    fill(255);
    if (this.collision) {
      fill(255);
      textSize(30);
      textAlign(CENTER);
      text(userInput.value(),width/2,height/2)
      //want the text to display the result not the input 
    }
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
  }

  this.update = function() {
    this.x -= this.speed;
  }

  this.offscreen = function() {
    if (this.x < -this.w) {
      return true;
    } else {
      return false;
    }
  }
}

 

