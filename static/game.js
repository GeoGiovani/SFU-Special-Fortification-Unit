//Getting username
var username = document.getElementById('username');
username = username.innerHTML;
var servername = document.getElementById('servername');
servername = servername.innerHTML;
var canvas = document.getElementById('canvas');

console.log(`Hello ${username}!`);
console.log(`Server ${servername}!`);

//these two messages are related to function 'showMessage'.
var messageOn = true;
var messageQueue = ["Welcome to S.F.U.! \nPress B to continue."
  , "S.F.U. stands for Special Fortification Unit. \nPress B to continue."
  , "What? You thought S.F.U. as in Simon Fraser University? \nPress B to continue."
  , "Well, you are right except its a game version of your time here \nat the University, sorry I meant Unit! *wink* *wink* \nPress B to continue."
  , "Let's dive into the instructions \nPress B to continue."
  , "Press W/A/S/D to move, B to see next message. \nPress B to continue."
  , "Press M to turn on/off the map. \nPress B to continue."
  , "And we have a cool weather feature on top right. \nPress B to continue."
  , "Don't forget to turn on/off the music at the bottom of the canvas. \nPress B to continue."
  , "Move mouse and click to shoot. \nPress B to continue."
  , "And survive. \nPress B to continue."
  , "Its you, your laptop and your water bottle against the whole world! \nPress B to continue."
  , "Prove that you can get through this by defeating your worst \nnightmares \nPress B to continue."
  , "Hint: Try getting through to ASB before you fail. \nPress B to continue."
  , "Good luck, have fun! \nPress B to continue."];
var mapOn = true;

// dead.
var dead = false;
var deadMessage = ["Try again!"]

//zoneChange function related.
var zoneChangeOn = false;
var zoneChangeOnTime;
var zoneNum = 0;

var questMessageOn = false;
var questMessageOnTime;
var questName = "";
var questCondition = "";
var questDescription = "";

var quizMessageOn = false;
var quizMessage = "";
var quizMessageOnTime;
var quizChoice;

var clearScreen = false;

var socket = io();
socket.on('message', function(data) {
  showMessage(data);
});

//socket id of the client. players[myId] will return the specific player's data.
var myId = "";
socket.on("passId", function(id){
  console.log('socket passId called');
  console.log(id);
  if (myId == "") {
    myId = id;
  }
});

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
}
var shoot = {
  shootBullet: false,
  x: 0,
  y: 0,
  middleX: 0,
  middleY: 0
}
var action = {
  interaction: false,
  reload: false
}

var sound = {
  background: null,
  shoot: null,
  reload: null,
  hit: null
}

var xPos = 0;
var yPos = 0;
var GRID_SIZE = 10; ///temporary variable

var mapImage = new Image();
mapImage.src = "";
var mapImageLoaded = false;
socket.on("deliverMapImageSrcToClient", function(imageSrc){
  // console.log('deliverMapImageSrcToClient called');
  if (!mapImageLoaded && imageSrc != "") {
    mapImage.src = imageSrc;
    mapImageLoaded = true;
  }
  //console.log('image source set to:', mapImage.src);
});

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
    case 69: // E
      action.interaction = true;
      break;
    case 82: // R
      action.reload = true;
      break;
    case 66: // B
      if (messageQueue.length <= 0) {
        messageOn = false;
      }
      else {
        messageQueue.shift();
        if (messageQueue.length <= 0) {
          messageOn = false;
        }
      }
      break;
    case 77:
      mapOn = !mapOn;
      break;
  }
});

canvas.addEventListener('click', function(event) {
  var newAudio = sound.shoot.cloneNode()
  newAudio.play()
  shoot.shootBullet = true;
  shoot.x = xPos;
  shoot.y = yPos;
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
    case 69: // E
      action.interaction = false;
      break;
    case 82: // R
      var newAudio = sound.reload.cloneNode()
      newAudio.play()
      action.reload = false;
      break;
  }
});

function makeSound(sound){
  switch (sound) {
    case "shoot":
      sound.shoot.play();
      break;
    case "reload":
      sound.reload.play();
      break;
    break;
  }
}

function initSound(){
  // var audio = new Audio();
  // for(var aSound in sound){
  //   aSound = audio;
  // }
  sound.background = new Audio();
  sound.shoot = new Audio();
  sound.reload = new Audio();
  sound.hit = new Audio();
  sound.background.src = "";
  sound.shoot.src =  "../static/audio/9mm.mp3";
  sound.reload.src = "../static/audio/reload.mp3";
  sound.hit.src = "../static/audio/HITMARKER.mp3";
}
// socket.on('sound', function(sound){
//   makeSound(sound);
// });

socket.on('grid-size', function(gridSize){
  GRID_SIZE = gridSize;
})
newPlayerData = {"username" : username, "servername" : servername};
socket.emit('new player', username, servername);

setInterval(function() {
  socket.emit('movement', movement);
  socket.emit('shoot', shoot);
  socket.emit('interact', action);
  shoot.shootBullet = false;

  //makeSound("bang");
}, 1000 / 30);

  //Moved canvas var to top so shoot could use it - GG
  // var canvas = document.getElementById('canvas');
  var startX = 0;
  var startY = 0;
  var canvasW = 800;
  var canvasH = 600;
  canvas.width = canvasW;
  canvas.height = canvasH;
  // canvas.cursor = "none"; //hide the original cursor
  var lastLoop = new Date();  //this is used for getting fps

window.addEventListener('mousemove', function (e) {
  xPos = e.pageX;
  yPos = e.pageY;
  // console.log(xPos);
  // console.log(yPos);
});

  var context = canvas.getContext('2d');
  socket.on('state', function(players, projectiles, enemies, zones,
    teamQuests, boss, specialObjects) {
    if (clearScreen) {
      return;
    }
    //console.log("socket event state called");
    if (players[myId] == 0) {
      //Died
      showDeadScreen();
      return;
    }
    if (myId == "") {
      socket.emit('requestPassId');
      return;
    }
    if (mapImage.src == "") {
      socket.emit("requestMapImageSrcFromServer");
      return;
    }
    context.clearRect(startX, startY, canvasW, canvasH);

    var middleX = players[myId].x - (canvasW)/2;
    var middleY = players[myId].y - (canvasH)/2;
    shoot.middleX = middleX;
    shoot.middleY = middleY;

    //'zoom' functionality. It's not done yet! Please just leave it =1..
    //It only works on map-drawing, NOT collision.
    var zoom = 1;

    //drawing the map from mapURL
    context.drawImage(mapImage, middleX, middleY,
      canvasW, canvasH, 0, 0, canvasW*zoom, canvasH*zoom);

    // context.fillStyle = 'green';
    var playerTexture = document.getElementById("player")
    for (var id in players) {

      var player = players[id];
      //Determines how the characters look
      // context.beginPath();
      // context.arc(player.x - middleX, player.y - middleY, GRID_SIZE/2 , 0, 2 * Math.PI);
      // context.fill();
      context.drawImage(playerTexture, player.x - middleX, player.y - middleY, GRID_SIZE, GRID_SIZE);

      showHealthBarAbove(player.x - middleX, player.y - middleY, player.health, player.maxHealth);
      showBulletBarAbove(player.x - middleX, player.y - middleY, player.clip, player.clipSize);
    }

    //Draw the bawss
    var bossImg = document.getElementById("boss");
    // context.drawImage(bossImg, boss.x - middleX, boss.y - middleY, 100, 130);
    context.beginPath();
    if (boss) {
      context.drawImage(bossImg, boss.x - middleX, boss.y - middleY, 100, 100);
      showHealthBarAbove(boss.x - middleX + 20, boss.y - middleY - 100, boss.health, boss.maxHealth); //temporary
    }


    // context.beginPath();
    // context.arc(boss.x - middleX, boss.y - middleY, GRID_SIZE/2 , 0, 2 * Math.PI);
    // context.fill();


    for (var id in projectiles) {
      var projectile = projectiles[id];
      //Determines how the bullets look
      // context.drawImage('../public/image/George.jpeg', projectile.x - middleX, projectile.y - middleY,10,10);
      context.beginPath();
      context.arc(projectile.x - middleX, projectile.y - middleY, 2, 0, 2 * Math.PI);
      context.fillStyle = 'black';
      context.fill();
    }

    var enemyTexture = document.getElementById('enemy');
    for (var id in enemies) {

      var enemy = enemies[id];
      //Determines how the bullets look // old radius = 6
      // context.drawImage(bossImg, enemy.x - middleX, enemy.y - middleY, 50, 65);
      // context.beginPath();
      // context.arc(enemy.x - middleX, enemy.y - middleY, GRID_SIZE/2, 0, 2 * Math.PI);
      // context.fillStyle = 'red';
      // context.fill();
      context.drawImage(enemyTexture, enemy.x - middleX, enemy.y - middleY, GRID_SIZE*2, GRID_SIZE*2);
      if (enemy.health < enemy.maxHealth) {
        showHealthBarAbove(enemy.x - middleX, enemy.y - middleY, enemy.health, enemy.maxHealth);
      }
    }

    context.fillStyle = "rgba(30, 10, 10, 0.6)";
    for (var id in zones) {
      var zone = zones[id];
      if (!zone.open) {
        context.beginPath();
        context.rect((zone.x*GRID_SIZE - middleX), (zone.y*GRID_SIZE - middleY), zone.width*GRID_SIZE, zone.height*GRID_SIZE);
        context.fill();
      }
    }

    context.font = "15px Arial";
    if(players[myId].clip) {
      context.fillStyle = "red";
      context.fillText("AMMO: " + players[myId].clip + "/" + players[myId].clipSize, canvasW-100, canvasH-70);
    }
    if(!players[myId].clip) {
      context.fillStyle = "red";
      context.fillText("RELOAD",  canvasW-70, canvasH-70);
    }

    if (specialObjects.rotundaBoss) {
      rotundaBoss = specialObjects.rotundaBoss;
      context.arc(rotundaBoss.x - middleX, rotundaBoss.y - middleY,
        rotundaBoss.size*GRID_SIZE/2, 0, 2 * Math.PI);
      context.fillStyle = 'black';
      context.fill();
      // showHealthBarAbove(rotundaBoss.x - middleX, rotundaBoss.y - middleY,
        // rotundaBoss.health, rotundaBoss.maxHealth);

      showBossHealthBar(rotundaBoss.health, rotundaBoss.maxHealth, 1);
    }

    if (specialObjects.ASBBoss) {


      asbBoss = specialObjects.ASBBoss;
      context.strokeStyle = "black";
      context.strokeText("F", asbBoss.x-middleX, asbBoss.y-middleY);
      context.fillStyle = "red";
      context.font = "bold 40px Arial";
      context.fillText("F", asbBoss.x-middleX, asbBoss.y-middleY);
      showBossHealthBar(asbBoss.health, asbBoss.maxHealth, 1);
    }


    if (specialObjects.RCBBoss2) {
      boss2 = specialObjects.RCBBoss2;
      context.arc(boss2.x - middleX, boss2.y - middleY,
        boss2.size*GRID_SIZE/2, 0, 2 * Math.PI);
      context.fillStyle = 'black';
      context.fill();
      if (specialObjects.RCBBoss1) {
        showBossHealthBar(boss2.health, boss2.maxHealth, 2);
      }
      else {
        showBossHealthBar(boss2.health, boss2.maxHealth, 1);
      }
    }

    if (specialObjects.RCBBoss1) {
      boss1 = specialObjects.RCBBoss1;
      context.arc(boss1.x - middleX, boss1.y - middleY,
        boss1.size*GRID_SIZE/2, 0, 2 * Math.PI);
      context.fillStyle = 'black';
      context.fill();
      showBossHealthBar(boss1.health, boss1.maxHealth, 1);
    }

    var thisLoop = new Date();
    context.fillText(Math.round(1000 / (thisLoop - lastLoop)) + " FPS", canvasW-95, canvasH-10);
    lastLoop = thisLoop;

    //showing Player health/score/etc.
    showMyData(players[myId]);
    var playerIndex = 1;
    for (var id in players) {
      if (id != myId && players[id] != 0 && players[id].health != undefined) {
        showOtherPlayerData(players[id], playerIndex);
        playerIndex += 1;
      }
    }

    showQuests(players[myId], teamQuests);



    // related to function 'showMessage'.
    if (messageOn && messageQueue.length >= 1) {
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      var zone = zones[id];
      context.beginPath();
      context.rect(20, 400, canvasW - 40, canvasH - 420);
      context.fill();
      context.fillStyle = "white";
      context.font = "25px Arial";
      var lines = messageQueue[0].split('\n');
      for (var i = 0; i<lines.length; i++) {
        context.fillText(lines[i], 40, 440 + i*35);
      }
    }

    //show small map!
    if (mapOn) {
      //hard-coded numbers.
      var mapX = 580;
      var mapY = 20;
      var mapMargin = 5;
      var mapWHRatio = 6/8;
      var smallMapWidth = 200;
      var smallMapHeight = smallMapWidth*mapWHRatio;

      var mapLeftCut = 60*GRID_SIZE;
      var mapTopCut = 20*GRID_SIZE;
      var mapAreaWidth = 380*GRID_SIZE;
      var mapAreaHeight = mapAreaWidth*mapWHRatio;



      //drawing black box behind the map
      context.beginPath();
      context.rect(mapX-mapMargin, mapY-mapMargin, smallMapWidth+2*mapMargin,
        smallMapHeight+2*mapMargin);
      context.fillStyle = "black";
      context.fill();

      //drawing the small map
      context.drawImage(mapImage, mapLeftCut, mapTopCut,
        mapAreaWidth, mapAreaHeight,
        mapX, mapY, smallMapWidth, smallMapHeight);


      // white background for coordinates
      context.fillStyle = "rgba(255, 255, 255, 0.82)";
      context.beginPath();
      context.rect(mapX+3, mapY+smallMapHeight+8, smallMapWidth,
        smallMapHeight*(1/3));
      context.fill();
      //showing player and mouse coordinates.
      context.fillStyle = "blue";
      context.font = "15px Arial";
      context.fillText("Player: x: " + (players[myId].x/GRID_SIZE) + ", y: "
        + (players[myId].y/GRID_SIZE), mapX+10, mapY+smallMapHeight+30);
      context.fillText("Mouse: x: " + (xPos+middleX)/GRID_SIZE + ", y: "
        + (yPos+middleY)/GRID_SIZE, mapX+10, mapY+smallMapHeight+50);

      //show players on small map

      for (var id in players) {
        var player = players[id];
        context.fillStyle = 'green';
        if (id == myId) {
          context.fillStyle = '#BBAA22';
        }
        context.beginPath();
        context.arc(mapX+(player.x-mapLeftCut)*(smallMapWidth/mapAreaWidth),
          mapY+(player.y-mapTopCut)*(smallMapWidth/mapAreaWidth),
          GRID_SIZE/3 , 0, 2 * Math.PI);
        context.fill();
      }

    }

    if (quizMessageOn) {
      if (specialObjects.ASBBoss) {
        quizMessageOn = false;
      }
      thisTime = new Date();
      if (thisTime > quizDeleteTime) {
        quizMessageOn = false;
      }
      else {
        displayQuiz(quizMessage);
        if (quizChoice) {
          displayQuizFloor(middleX, middleY, quizChoice);
        }
      }

    }

    //zone Change show
    if (zoneChangeOn) {
      var zoneElapse = new Date();
      var zoneboxY = 500;
      var boxLength = zones[zoneNum].description.length*13;
      if (zoneElapse - zoneChangeOnTime > 5000) {
        zoneChangeOn = false;
        context.fillStyle = `rgba(255, 255, 255, 0)`;
      }
      else if (zoneElapse - zoneChangeOnTime < 800) {
        context.fillStyle = `rgba(255, 50, 50, ${0.9*((zoneElapse - zoneChangeOnTime))/800})`;
        context.beginPath();
        context.rect(10, zoneboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*((zoneElapse - zoneChangeOnTime))/800})`;
      }
      else if (zoneElapse - zoneChangeOnTime > 3000) {
        context.fillStyle = `rgba(255, 50, 50, ${0.9*(3000+2000-(zoneElapse - zoneChangeOnTime))/2000})`;
        context.beginPath();
        context.rect(10, zoneboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*(3000+2000-(zoneElapse - zoneChangeOnTime))/2000})`;
      }
      else {
        context.fillStyle = "rgba(255, 50, 50, 0.9)";
        context.beginPath();
        context.rect(10, zoneboxY, boxLength, 85);
        context.fill();
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
      }
      context.font = "italic 35px Arial";
      context.fillText("ENTER: "+zones[zoneNum].name, 50, zoneboxY+40);

      context.font = "italic 15px Arial";
      context.fillText("- " + zones[zoneNum].description, 40, zoneboxY+70);

      context.font = "normal";
    }

    //zone Change show
    if (questMessageOn) {
      var questElapse = new Date();
      var questboxY = 500;
      var boxLength = 700;
      if (questElapse - questMessageOnTime > 5000) {
        questMessageOn = false;
        context.fillStyle = `rgba(255, 255, 255, 0)`;
      }
      else if (questElapse - questMessageOnTime < 800) {
        context.fillStyle = `rgba(200, 180, 0, ${0.9*((questElapse - questMessageOnTime))/800})`;
        context.beginPath();
        context.rect(10, questboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*((questElapse - questMessageOnTime))/800})`;
      }
      else if (questElapse - questMessageOnTime > 3000) {
        context.fillStyle = `rgba(200, 180, 0, ${0.9*(3000+2000-(questElapse - questMessageOnTime))/2000})`;
        context.beginPath();
        context.rect(10, questboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*(3000+2000-(questElapse - questMessageOnTime))/2000})`;
      }
      else {
        context.fillStyle = "rgba(200, 180, 0, 0.9)";
        context.beginPath();
        context.rect(10, questboxY, boxLength, 85);
        context.fill();
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
      }
      context.font = "italic 35px Arial";
      context.fillText("COMPLETE: "+questName, 50, questboxY+40);

      context.font = "italic 15px Arial";
      context.fillText("["+questCondition + "]   " + questDescription, 40, questboxY+70);

      context.font = "normal";
    }


    if (players[myId].health < players[myId].maxHealth) {
      context.fillStyle = `rgba(255, 0, 0,
        ${0.3*((players[myId].maxHealth-players[myId].health)/players[myId].maxHealth)})`;
        context.beginPath();
        context.rect(0, 0, canvasW, canvasH);
        context.fill();
    }
  });


  socket.on("create map", function(mapData){
    initSound();
    processMapDrawing(mapData);
  });


// Support Functions ------------------------------------
function showMyData(player) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(15, 70, 100, 15);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(15, 70, (player.health/player.maxHealth)*100, 15);
  context.fill();
  context.fillStyle = "white";
  context.font = "bold italic 12px Arial";
  context.fillText("HP (" + Math.round(player.health) + "/" + player.maxHealth + ")", 18, 82);
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(15, 90, 100, 15);
  context.fill();
  context.fillStyle = "blue";
  context.beginPath();
  context.rect(15, 90, (player.clip/player.clipSize)*100, 15);
  context.fill();
  context.fillStyle = "white";
  context.font = "bold italic 12px Arial";
  context.fillText("CLIP (" + player.clip + "/" + player.clipSize + ")", 18, 102);

  context.fillStyle = "black";
  context.font = "bold 35px Arial";
  context.fillText(player.username, 17, 50);

  //score
  context.fillStyle = "black";
  context.font = "bold 15px Arial";
  context.fillText("Score: "+player.score, 17, 120);
}
function showOtherPlayerData(player, playerIndex) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(70+110*playerIndex, 55, 70, 10);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(70+110*playerIndex, 55, (player.health/player.maxHealth)*70, 10);
  context.fill();
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(70+110*playerIndex, 68, 70, 10);
  context.fill();
  context.fillStyle = "blue";
  context.beginPath();
  context.rect(70+110*playerIndex, 68, (player.health/player.maxHealth)*70, 10);
  context.fill();

  context.fillStyle = "black";
  context.font = "bold 20px Arial";
  context.fillText(player.username, 70+110*playerIndex+2, 45);


}
function showQuests(player, teamQuests) {
  var line = 0;
  context.lineWidth = 1;
  context.fillStyle = "#0AC";
  context.strokeStyle = "rgb(255, 255, 255, 0.5)";
  context.font = "16px Arial";
  context.strokeText("Quests", 12, 150);
  context.fillText("Quests", 12, 150);

  context.fillStyle = "#0D8";
  var i = 0;
  for (; i < teamQuests.length; i++) {
    if (teamQuests[i].display) {
      if (teamQuests[i].isMainQuest) {
          context.font = "bold italic 13px Arial";
      }
      else {
          context.font = "italic 13px Arial";
      }
      context.strokeText("["+teamQuests[i].name + "] " + teamQuests[i].condition + " " + teamQuests[i].progressText, 10, 170+line*20);
      context.fillText("["+teamQuests[i].name + "] " + teamQuests[i].condition + " " + teamQuests[i].progressText, 10, 170+line*20);
      line += 1;
      if (teamQuests[i].completeDescription) {
        context.strokeText("     "+teamQuests[i].completeDescription, 10, 170+line*20);
        context.fillText("     "+teamQuests[i].completeDescription, 10, 170+line*20);
        line += 1;
      }
      if (line > 20) {
        break;
      }
    }
  }

  context.fillStyle = "#0AC";
  context.strokeStyle = "rgb(255, 255, 255, 0.5)";
  for (; i < player.quests.length+teamQuests.length; i++) {
    var j = i-teamQuests.length;
    if (player.quests[j].display) {
      if (player.quests[j].isMainQuest) {
          context.font = "bold italic 13px Arial";
      }
      else {
          context.font = "italic 13px Arial";
      }
      context.strokeText("["+player.quests[j].name + "] " + player.quests[j].condition + " " + player.quests[j].progressText, 10, 170+line*20);
      context.fillText("["+player.quests[j].name + "] " + player.quests[j].condition + " " + player.quests[j].progressText, 10, 170+line*20);
      line += 1;
      if (line > 10) {
        break;
      }
    }
  }
}

function showHealthBarAbove(x, y, health, maxHealth) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(x-20, y-30, 40, 6);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(x-20, y-30, (health/maxHealth)*40, 6);
  context.fill();
}
function showBulletBarAbove(x, y, clip, clipSize) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(x-20, y-20, 40, 6);
  context.fill();
  context.fillStyle = "blue";
  context.beginPath();
  context.rect(x-20, y-20, (clip/clipSize)*40, 6);
  context.fill();
}

function showBossHealthBar(health, maxHealth, bossNum) {
  context.lineWidth = 10;
  strokeTime = new Date()%3000;
  if (strokeTime < 1500) {
    strokeLevel = 0.8*(strokeTime/1500);
  }
  else {
    strokeLevel = 0.8*(3000-strokeTime)/1500;
  }

  context.strokeStyle = `rgb(255, 255, 255, ${strokeLevel})`;
  context.strokeRect(150, 100+30*(bossNum-1), 400, 23);

  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(150, 100+30*(bossNum-1), 400, 23);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(150, 100+30*(bossNum-1), (health/maxHealth)*400, 23);
  context.fillStyle = "red";
  context.fill();

  context.fillStyle = "white";
  context.font = "bold italic 18px Arial";
  context.fillText("TARGET HP (" + Math.round(health) + "/" + maxHealth + ")", 155, 118+30*(bossNum-1));
}

function processMapDrawing(mapData){
  console.log(mapData);
  //called ONLY when numPlayers: 0 -> 1.
  //draws the whole canvas, and saves to images file.
  /*
  This creates the map to 'image', hence the collision control is separate
  this map. when there is a revision to map (e.g. door open)
  */
  //shows only wall now.
   // TODO: change this to variable, not constant literal!
  //const margin = 300;
  var allMap = document.createElement("canvas");
  allMap.width = 500*GRID_SIZE;
  allMap.height = 500*GRID_SIZE;
  var allMapCtx = allMap.getContext('2d');

  //context.clearRect(startX, startY, canvasW, canvasH);
  /*
  aqImage = new Image();
  aqImage.src = '../image/aq.jpeg';
  aqImage.onload = function(){
    context.drawImage(aqImage, 0, 0);
  }*/
  // var texture = new Image();
  // texture.src = "/objects/wall.png"
  for (var x = 0; x < mapData.length; x++) {
    var line = "";
    for (var y = 0; y < mapData[mapData.length - 1].length; y++){
      // console.log("\tMapdata[" + x + "][" + y + "]"); ////*****
      // var source = mapData[x][y].textureSrc;
      // console.log(source)
      // var pattern = ctx.createPattern(source, "repeat");
      // var img = new Image();
      // img.src = "static/objects/player1.jpg";
      // img.onload = function(){
      //   allMapCtx.drawImage(img, 300, 300, 300, 300);
      // }
      // var textureLoaded = false;
      // texture.onload = function(){
      //   textureLoaded = true;
      // }
      var wall = document.getElementById("wall");
      if(mapData[x][y] != '' && mapData[x][y].name == "floor")
      {
        allMapCtx.beginPath();
        allMapCtx.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        allMapCtx.fillStyle = mapData[x][y].color;
        allMapCtx.fill();
      }
      else if(mapData[x][y] != '' && mapData[x][y].name == "wall")
      {
        // var source = mapData[x][y].textureSrc;
        // console.log(source)
        // var pattern = ctx.createPattern(source, "repeat");
        // allMapCtx.beginPath();
        allMapCtx.drawImage(wall, x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        // allMapCtx.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        //TODO: MAPTEXTURE Problem here below lines!!
        // allMapCtx.fillStyle = texture.src;
        // allMapCtx.fillStyle = "#333";
        // while (!textureLoaded) {
        //   console.log("waiting for the texture...");
        // }

        allMapCtx.fill();
      }


      if (mapData[x][y] == ''){
        line += "0";
      }else if(mapData[x][y].name == "wall"){
        line += "1";
      }else{
        line += "!";
      }
    }

  }
  //console.log(mapData);/////*****
  mapImage.src = allMap.toDataURL();
  console.log('socket event create map called: URL set to', mapImage.src);/////*****
  socket.emit("deliverMapImageSrcToServer", mapImage.src);
  delete allMap;
}

function showMessage(messageString) {
  messageOn = true;
  messageQueue.push(messageString);
}

function showDeadScreen() {
  if (dead) {
    return;
  }
  dead = true;
  context.clearRect(startX, startY, canvasW, canvasH);
  context.beginPath();
  context.fillStyle = "#BB0000";
  context.rect(0, 0, canvasW, canvasH);
  context.fill();

  context.fillStyle = "white";
  context.font = "80px Arial";
  context.fillText("You Failed!", canvasW/2-200, canvasH/2-50);

  context.fillStyle = "white";
  context.font = "20px Arial";
  var messageNum = Math.random() * deadMessage.length;
  console.log(messageNum);
  var deadMsg = deadMessage[Math.floor(messageNum)];
  var lines = deadMsg.split('\n');
  for (var i = 0; i<lines.length; i++) {
    context.fillText(lines[i], 120, canvasH/2 + 50 + 30*i);
  }
}

function displayQuiz(message) {
  context.lineWidth = 10;
  strokeTime = new Date()%3000;
  if (strokeTime < 1500) {
    strokeLevel = 0.8*(strokeTime/1500);
  }
  else {
    strokeLevel = 0.8*(3000-strokeTime)/1500;
  }

  context.strokeStyle = `rgb(255, 255, 255, ${strokeLevel})`;
  context.strokeRect(100, 120, 600, 100);

  context.fillStyle = "black";
  context.beginPath();
  context.rect(100, 120, 600, 100);
  context.fill();

  context.fillStyle = "white";
  context.font = "bold italic 22px Arial";
  context.fillText(message, 120, 150);
}
function displayQuizFloor(middleX, middleY, choices) {
  console.log(choices)
  // context.fillText(choices[0], 254*GRID_SIZE - middleX, 150*GRID_SIZE - middleY);
  showQuizFloorText(choices[0], 254, 220, middleX, middleY);
  showQuizFloorText(choices[1], 279, 220, middleX, middleY);
  showQuizFloorText(choices[2], 307, 220, middleX, middleY);
  showQuizFloorText(choices[3], 254, 242, middleX, middleY);
  showQuizFloorText(choices[4], 279, 242, middleX, middleY);
  showQuizFloorText(choices[5], 309, 242, middleX, middleY);

}

function showQuizFloorText(message, x, y, middleX, middleY) {
  if (!message) {
    return;
  }
  console.log(message);
  context.fillStyle = "black";
  context.font = "20px Arial";

  lines = message.split(" ");
  for (var i = 0; i < lines.length; i++) {
    console.log(lines[i]);
    context.fillText(lines[i], x*GRID_SIZE - middleX, (y)*GRID_SIZE+20*i - middleY);
  }
}

socket.on("zoneChange", function(num){
  //zone changed!
  zoneChangeOn = true;
  zoneChangeOnTime = new Date();
  zoneNum = num;
});

socket.on("questOver", function(qName, qCondition, qDescription) {
  questMessageOn = true;
  questMessageOnTime = new Date();
  questName = qName;
  questCondition = qCondition;
  questDescription = qDescription;
  // console.log("show quest: ", qName);
});

socket.on("zoneOpen", function(zoneNum) {
  console.log(zoneNum);
});

socket.on("quizMessage", function(message, time, choice) {
  // var quizMessageOn = false;
  // var quizMessage = "";
  // var quizMessageOnTime;
  quizMessageOn = true;
  quizMessageOnTime = new Date();
  quizMessage = message;
  quizDeleteTime = time*1000 + quizMessageOnTime;
  if (choice) {
    quizChoice = choice;
  }
});

socket.on("game clear", function() {
  clearScreen = true;
  context.clearRect(startX, startY, canvasW, canvasH);
  context.beginPath();
  context.fillStyle = "white";
  context.rect(0, 0, canvasW, canvasH);
  context.fill();

  context.fillStyle = "black";
  context.font = "80px Arial";
  context.fillText("Congratulations!", canvasW/2-200, canvasH/2-50);
  context.font = "40px Arial";
  context.fillText("I'm too sleepy to make this screen.", canvasW/2-200, canvasH/2+100);

});

//=============================================================================
// George Workpace
var logoutButton = document.getElementById('log_out_button' );
logoutButton.addEventListener('click', function(event) {
  logoutButton.value = username;
});

//=============================================================================

  // Fazal' Workstation -------------------------------------------------------------------------
  // var enemyContext = canvas.getContext('2d');
  // socket.on('enemyState', function(enemies) {
  //   context.clearRect(0, 0, 800, 600);
  //   context.fillStyle = 'red';
  //   for (var id in enemies) {
  //     var enemy = enemies[id];
  //     //Determines how the characters look
  //     context.beginPath();
  //     context.arc(enemy, enemy, 10, 0, 2 * Math.PI);
  //     context.fill();
  //   }
  // });

  // get a refrence to the canvas and its context
// var canvas = document.getElementById("canvas");
// var context = canvas.getContext("2d");

// newly spawned objects start at Y=25
// var spawnLineY = 25;

// // spawn a new object every 1500ms
// var spawnRate = 1500;

// // set how fast the objects will fall
// var spawnRateOfDescent = 0.50;

// // when was the last object spawned
// var lastSpawn = -1;

// // this array holds all spawned object
// // var objects = [];
// var enemies = {
//   numEnemies: 0
// }

// save the starting time (used to calc elapsed time)
// var startTime = Date.now();

// // start animating
// animate();

// var enemyID = 0;

// function spawnRandomObject() {

//     // select a random type for this new object
//     var t;

    // About Math.random()
    // Math.random() generates a semi-random number
    // between 0-1. So to randomly decide if the next object
    // will be A or B, we say if the random# is 0-.49 we
    // create A and if the random# is .50-1.00 we create B

//     if (Math.random() < 0.50) {
//         t = "red";
//     } else {
//         t = "blue";
//     }

//     // create the new object
//     var enemy = {
//         // set this objects type
//         type: t,
//         // set x randomly but at least 15px off the canvas edges
//         x: Math.random() * (canvas.width - 30) + 15,
//         // set y to start on the line where objects are spawned
//         y: spawnLineY,
//     }

//     // add the new object to the objects[] array
//     enemies[enemyID] = enemy;
//     enemyID++;
// }

// spawnRandomObject();

// function animate() {

//     // get the elapsed time
//     var time = Date.now();

    // // see if its time to spawn a new object
    // if (time > (lastSpawn + spawnRate)) {
    //     lastSpawn = time;
    //     spawnRandomObject();
    // }

//     // request another animation frame
//     requestAnimationFrame(animate);

//     // clear the canvas so all objects can be
//     // redrawn in new positions
//     context.clearRect(0, 0, canvas.width, canvas.height);

//     // draw the line where new objects are spawned
//     context.beginPath();
//     context.moveTo(0, spawnLineY);
//     context.lineTo(canvas.width, spawnLineY);
//     context.stroke();

//     // move each object down the canvas
//     for (var i = 0; i < objects.length; i++) {
//         var object = objects[i];
//         object.y += spawnRateOfDescent;
//         context.beginPath();
//         context.arc(object.x, object.y, 8, 0, Math.PI * 2);
//         context.closePath();
//         context.fillStyle = object.type;
//         context.fill();
//     }

// }

// -----------------------------------------------------------------------
