roomName/* ============================CODE WRITING RULES==============================
 *
 * Our objective is to write CLEAN, well written code. Please follow these
 * basic guidelines:
 *
 *       1) Line width will be set to 80 chars. Lines of code longer than this
 *          will be divided up across multiple lines.
 *
 *          link to how to set character line rules in VSCODE:
 *          https://tinyurl.com/y2skbpbk
 *
 *       2) Variable naming will be in camelCase. Use good variable names.
 *
 *       3) DOCUMENT changes. If you refactor a line of code, document exactly
 *          what was done to change it, and initial/date the change.
 *
 *       4) Keep spacing consistent, such as indentations and parenthesis
 *          positioning.
 *
 *       5) Put a comment above EVERY function declaration describing its
 *          purpose.
 *
 * ==========================================================================*/
// Testing with mocha and chai
// adding export so that the function can be accessed by indexTest.js
module.exports = {
  sayHello: function(){
    return 'hello';
  },
  addNumbers: function(value1, value2){
    return value1 + value2;
  },
  roomData: function(value1){
    return giveRoomData(value1);
  }
}

// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const fs = require('fs');
var app = express();
var server = http.Server(app);
app.set('port', 5000);
const PORT = process.env.PORT || 5000
var io = socketIO(server);
//database
const { Pool } = require('pg')
var pool
pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use('/static', express.static(__dirname + '/static'));// Ring
app.get('/', function(request, response) {
  var user = {'username' : 'shisata'}
  response.render('pages/matchmaking', user);
});// Starts the server.
server.listen(PORT, function() {
  console.log('Starting server on port 5000');
});

//setting up default viewpath to views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Looking for static files in public folder
app.use(express.static(path.join(__dirname, 'public')));

//Players object will contain all information about each player's position,
//health, etc.
var players = {
  numPlayers: 0
};

//Projectiles object will keep track of active projectiles
var projectiles = {
  numProjectiles: 0
}
var bulletCount = 0;

//Enemies
var enemies = {
  numEnemies: 0
}
enemyID = 0;

//Game rooms
var rooms = {};
var getRoomBySocketId = {};

var mapImageSrc = "";
var mapData; // 2d array of the map
const GRID_SIZE = 10; // each grid size for map

//Creates a new player and puts them into the gane room specified by roomName
io.on('connection', function(socket) {
  socket.emit('grid-size', GRID_SIZE);
  socket.on('new player', function(username, roomName) {
    console.log("data.server: ", roomName);
    // if (roomName == undefined) {
    //   roomName = "STUB";
    // }
    //client who called the 'new player' joins the server 'roomName'.
    console.log('socket event new player called');
    console.log("Logging Game Room Name", roomName)
    socket.join(roomName);
    getRoomBySocketId[socket.id] = roomName;

    //if room does not exist, create a room.
    if ([roomName] == undefined) {
      roomName = "STUB"
    }

    //This condition is commented out because the 'disconnect' event is
    //commented out too. 'disconnect' is having multiple-call problem and
    //causing error for map-loading.
    //if (players.numPlayers < 4) {
    initLevel(roomName); //TODO
    createPlayer(socket.id, roomName, username);
    socket.emit("passId", socket.id);

    //constructs the very initial map for the game.
    //'disconnect' seems to have some problems. I'm fixing it to:
    //create map WHENever
    // if (players.numPlayers <= 1) {
    //   var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
    //   var processor = require('./static/objects/mapProcessor.js');
    //   mapData = processor.constructFromData(mapDataFromFile);
    //   //console.log(mapData);///////*******
    //   socket.emit('create map', mapData);
    //   console.log('players.numPlayers: ', players.numPlayers, ', create map called');
    // }
    // else {
    //   console.log('players.numPlayers: ', players.numPlayers);
    //   socket.emit("deliverMapImageSrcToClient", mapImageSrc);
    // }
  });

  //socket on functions for ID, Map, etc.
  socket.on('requestPassId', function(){
    // socket.emit("passId", socket.id);
    socket.broadcast.to(socket.id).emit("passId", socket.id);
  });
  socket.on("deliverMapImageSrcToServer", function(imageSrc){
    //console.log('deliverMapImageSrcToServer called');
    // mapImageSrc = imageSrc;
    rooms[getRoomBySocketId[socket.id]].mapImageSrc = imageSrc;
  });
  socket.on("requestMapImageSrcFromServer", function(){
    // console.log('imageSrc returned for request:', mapImageSrc);
    // console.log('requestMapImageSrcFromServer called');
    socket.emit("deliverMapImageSrcToClient", mapImageSrc);
  });

  // Responds to a movement event
  socket.on('movement', function(data) {
    // var player = players[socket.id] || {};
    // movePlayer(player, data);
    if (getRoomBySocketId == undefined
      || getRoomBySocketId[socket.id] == undefined) {
      return;
    }
    var player = rooms[getRoomBySocketId[socket.id]].players[socket.id] || {};
    movePlayer(player, data, getRoomBySocketId[socket.id]);
  });

  //Code block to respond to shooting
  socket.on('shoot', function(data) {
    if (data.shootBullet) {
      var rm = getRoomBySocketId[socket.id]
      // console.log("emit sound");
      // var sound = "bang";
      // socket.emit('sound', sound);
      generateProjectile(socket.id, data, rm);
    }
  });

  //Removes disconnected player
  socket.on('disconnect', function() {
    //   if (players[socket.id] == undefined) {
      //     //if the socket id is not valid, ignore the disconnect signal
      //     console.log('invalid disconnect call: ignoring...')
      //     return;
      //   }
      //   logOutPlayer(players[socket.id].username);
      //   //players[socket.id] = 0;
      //   delete players[socket.id];
      //   players.numPlayers -= 1;
      // });
      //Collects client data at 60 events/second
    console.log('socket event disconnect called');
    if (getRoomBySocketId == undefined
      || getRoomBySocketId[socket.id] == undefined
      || rooms[getRoomBySocketId[socket.id]] == undefined
      || rooms[getRoomBySocketId[socket.id]].players[socket.id] == undefined) {
      //if the socket id is not valid, ignore the disconnect signal
      console.log('invalid disconnect call: ignoring...')
      return;
    }
    //players[socket.id] = 0;
    delete rooms[getRoomBySocketId[socket.id]].players[socket.id];
    rooms[getRoomBySocketId[socket.id]].players.numPlayers -= 1;
  });
});
// setInterval(function() {
//   if(players.numPlayers > 0){
//   //  console.log("interval player")
//     moveProjectiles();
//     moveEnemies();
//     handleBulletCollisions();
//     generateEnemies();
//     io.sockets.emit('state', players, projectiles, enemies);
//   }
// }, 1000 / 120);

setInterval(function() {
  for (var rm in rooms) {
    if(rooms[rm].players.numPlayers > 0){
      //  console.log("interval player")
        moveProjectiles(rm);
        moveEnemies(rm);
        handleBulletCollisions(rm);
        generateEnemies(rm);
        //console.log("LOGGING rm", rm);
        io.sockets.to(rm).emit('state', rooms[rm].players,
          rooms[rm].projectiles, rooms[rm].enemies);
      }
  }
}, 1000 / 120);



//=============================================================================
//Functions

// Creates a new player
// function createPlayer(id, usname) {
//   players.numPlayers += 1;
//   players[id] = {
//     playerID: players.numPlayers,
//     username: usname,
//     x: 160 * GRID_SIZE,
//     y: 59 * GRID_SIZE,
//     health: 4.33,
//     level: 1,
//     damage: 5,
//     speed: 3,
//     score: 0
//   };
// }

//Creates a new player
function createPlayer(id, roomName, username) {
  rooms[roomName].players.numPlayers += 1;//fix
  rooms[roomName].players[id] = {
    playerID: rooms[roomName].players.numPlayers,
    username: username,
    x: 160 * GRID_SIZE,
    y: 59 * GRID_SIZE,
    health: 4.33,
    level: 1,
    damage: 5,
    speed: 3,
    score: 0
  };
}


// Calculates each players score
function playerScore(){

}

// Calculates each players health
function playerHealth(){

}

function giveRoomData(roomName) {
  //Players object will contain all information about each player's position,
  var room = {}

  room.players = {
    numPlayers: 0
  };

  //Projectiles object will keep track of active projectiles
  room.projectiles = {
    numProjectiles: 0
  }
  room.bulletCount = 0;

  //Enemies
  room.enemies = {
    numEnemies: 0
  }
  room.enemyID = 0;

  room.mapImageSrc = "";
  room.mapData; // 2d array of the map

  // when was the last object spawned
  room.lastSpawn = -1;
  room.spawnRate = 2000;

  return room
}

//Creates a new room
function initLevel(roomName) {
  rooms[roomName] = giveRoomData(roomName);
  console.log("rooms[roomName]: " + rooms[roomName])
  console.log("LOGGING ROOMS", rooms[roomName]);

  var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
  var processor = require('./static/objects/mapProcessor.js');
  rooms[roomName].mapData = processor.constructFromData(mapDataFromFile);
  //console.log(mapData);///////*******
  io.sockets.to(roomName).emit('create map', rooms[roomName].mapData);
  console.log('players.numPlayers: ', rooms[roomName].players.numPlayers, ', create map called');
}

// //Moves a player in response to keyboard input
// function movePlayer(player, data) {
//   //Modified the values here to reflect player speed - GG 2019.10.26 17:30
//   var originX = player.x;
//   var originY = player.y;
//   //console.log(player.x + ", " + player.y)////*****
//   if (data.left) {
//     player.x -= player.speed;
//   }
//   if (data.up) {
//     player.y -= player.speed;
//   }
//   if (data.right) {
//     player.x += player.speed;
//   }
//   if (data.down) {
//     player.y += player.speed;
//   }
//   if(player != undefined){
//     if(hasCollision(player.x, player.y)){
//       player.x = originX;
//       player.y = originY
//     }
//   }
// }

//Moves a player in response to keyboard input
function movePlayer(player, data, rm) {
  //Modified the values here to reflect player speed - GG 2019.10.26 17:30
  var originX = player.x;
  var originY = player.y;
  //console.log(player.x + ", " + player.y)////*****
  if (data.left) {
    player.x -= player.speed;
  }
  if (data.up) {
    player.y -= player.speed;
  }
  if (data.right) {
    player.x += player.speed;
  }
  if (data.down) {
    player.y += player.speed;
  }
  if(player != undefined){
    if(hasCollision(player.x, player.y, rm)){
      player.x = originX;
      player.y = originY
    }
  }
}


// //check if there is collision  at direction
// function hasCollision(x, y){
//   var gridX = Math.floor(x / GRID_SIZE);
//   var gridY = Math.floor(y / GRID_SIZE);
//   if(mapData == undefined || mapData[gridX] == undefined
//     || mapData[gridX][gridY] == undefined){
//     // console.log("collision " + gridX + ", " + gridY)
//     return false;
//   }else if(mapData[gridX][gridY].collision == true){
//     // console.log("collision " + gridX + ", " + gridY)
//     return true;
//   }
//   return false;
// }

//check if there is collision  at direction
function hasCollision(x, y, rm){
  var gridX = Math.floor(x / GRID_SIZE);
  var gridY = Math.floor(y / GRID_SIZE);
  if(rooms[rm] == undefined || rooms[rm].mapData == undefined
    || rooms[rm].mapData[gridX] == undefined
    || rooms[rm].mapData[gridX][gridY] == undefined) {
    // console.log("collision " + gridX + ", " + gridY)
    // console.log("RETURNING FALSE, ROOM MAPDATA PROBLEM");
    return false;
  } else if(rooms[rm].mapData[gridX][gridY].collision == true){
    // console.log("collision " + gridX + ", " + gridY)
    return true;
  }
  return false;
}


// //Generates a projectile on shoot input
// function generateProjectile(id, data) {
//   projectiles.numProjectiles++;

//   mouseX = data.x;
//   mouseY = data.y;
//   playerX = players[id].x - data.middleX;
//   playerY = players[id].y - data.middleY;

//   dx = mouseX - playerX;
//   dy = mouseY - playerY;

//   theta = Math.atan(dx / dy);

//   velX = players[id].speed * Math.sin(theta);
//   velY = players[id].speed * Math.cos(theta);
//   if (dy < 0) {
//     velY *= -1;
//     velX *= -1;
//   }

//   projectiles[bulletCount] = {
//     x: players[id].x + (4 * velX),
//     y: players[id].y + (4 * velY),
//     vx: velX,
//     vy: velY
//   };

//   bulletCount++;
//   //reset bullet count
//   if (bulletCount > 100) {
//     bulletCount = 0;
//   }
// }

//Generates a projectile on shoot input
function generateProjectile(id, data, rm) {
  rooms[rm].projectiles.numProjectiles++;

  mouseX = data.x;
  mouseY = data.y;
  playerX = rooms[rm].players[id].x - data.middleX;
  playerY = rooms[rm].players[id].y - data.middleY;

  dx = mouseX - playerX;
  dy = mouseY - playerY;

  theta = Math.atan(dx / dy);

  velX = rooms[rm].players[id].speed * Math.sin(theta);
  velY = rooms[rm].players[id].speed * Math.cos(theta);
  if (dy < 0) {
    velY *= -1;
    velX *= -1;
  }

  rooms[rm].projectiles[rooms[rm].bulletCount] = {
    x: rooms[rm].players[id].x + (4 * velX),
    y: rooms[rm].players[id].y + (4 * velY),
    vx: velX,
    vy: velY
  };

  rooms[rm].bulletCount++;
  //reset bullet count
  if (rooms[rm].bulletCount > 100) {
    spawnRandomObjectbulletCount = 0;
  }
}

// //Spawn a random enemy
// function spawnRandomObject() {

//   // About Math.random()
//   // Math.random() generates a semi-random number
//   // between 0-1. So to randomly decide if the next object
//   // will be A or B, we say if the random# is 0-.49 we
//   // create A and if the random# is .50-1.00 we create B

//   // add the new object to the objects[] array
//   if (enemies.numEnemies < 10) {
//     enemies[enemyID] = {
//       // type: t,
//       // set x randomly but at least 15px off the canvas edges
//       x: Math.random() * 350,
//       // set y to start on the line where objects are spawned
//       y: Math.random() * 300,
//       vx: 5,
//       vy: 5,
//       speed: .5,
//       health: 4
//     }
//     enemies.numEnemies++;
//     enemyID++;
//   }
// }

//Spawn a random enemy
function spawnRandomObject(rm) {

  // About Math.random()
  // Math.random() generates a semi-random number
  // between 0-1. So to randomly decide if the next object
  // will be A or B, we say if the random# is 0-.49 we
  // create A and if the random# is .50-1.00 we create B

  // add the new object to the objects[] array
  if (rooms[rm].enemies.numEnemies < 10) {
    rooms[rm].enemies[rooms[rm].enemyID] = {
      // type: t,
      // set x randomly but at least 15px off the canvas edges
      x: Math.random() * 350,
      // set y to start on the line where objects are spawned
      y: Math.random() * 300,
      vx: 5,
      vy: 5,
      speed: .5,
      health: 4
    }
    rooms[rm].enemies.numEnemies++;
    rooms[rm].enemyID++;
  }
}


// // when was the last object spawned
// var lastSpawn = -1;
// var spawnRate = 2000;

// //Generate enemies
// function generateEnemies() {

//   // spawn a new object
//   if (spawnRate > 1000) {
//     spawnRate = spawnRate -= 1;
//   }

//   // get the elapsed time
//   var time = Date.now();

//   // see if its time to spawn a new object
//   if (time > (lastSpawn + spawnRate)) {
//     lastSpawn = time;
//     spawnRandomObject();
//     //console.log('emeny spawned. spawnRate: ', spawnRate);
//   }
// }

//Generate enemies
function generateEnemies(rm) {

  // spawn a new object
  if (rooms[rm].spawnRate > 1000) {
    rooms[rm].spawnRate = rooms[rm].spawnRate -= 1;
  }

  // get the elapsed time
  var time = Date.now();

  // see if its time to spawn a new object
  if (time > (rooms[rm].lastSpawn + rooms[rm].spawnRate)) {
    rooms[rm].lastSpawn = time;
    spawnRandomObject(rm);
    //console.log('emeny spawned. spawnRate: ', spawnRate);
  }
}

// //Move projectiles along the screen
// function moveProjectiles() {
//   for (var id in projectiles) {
//     if (projectiles[id]) {
//       var delBullet = false;
//       var originX = projectiles[id].x;
//       var originY = projectiles[id].y;
//       projectiles[id].x += projectiles[id].vx;
//       projectiles[id].y += projectiles[id].vy;
//       if(hasCollision(projectiles[id].x, projectiles[id].y)){
//         projectiles[id].x = originX;
//         projectiles[id].y = originY;
//         delBullet = true;
//         // deleteBullet(id);
//       }
//       //Delete stale projectiles
//       if ( (projectiles[id].x > 5000) || (projectiles[id].y > 5000) ||
//           (projectiles[id].x < -5000) || (projectiles[id].y < -5000)) {
//           delBullet = true;
//       }
//       if(delBullet == true){
//         deleteBullet(id);
//       }
//     }
//   }
// }

function moveProjectiles(rm) {
  for (var id in rooms[rm].projectiles) {
    if (rooms[rm].projectiles[id]) {
      var delBullet = false;
      var originX = rooms[rm].projectiles[id].x;
      var originY = rooms[rm].projectiles[id].y;
      rooms[rm].projectiles[id].x += rooms[rm].projectiles[id].vx;
      rooms[rm].projectiles[id].y += rooms[rm].projectiles[id].vy;
      if(hasCollision(rooms[rm].projectiles[id].x, rooms[rm].projectiles[id].y, rm)){
        rooms[rm].projectiles[id].x = originX;
        rooms[rm].projectiles[id].y = originY;
        delBullet = true;
        // deleteBullet(id);
      }
      //Delete stale projectiles
      if ( (rooms[rm].projectiles[id].x > 5000) || (rooms[rm].projectiles[id].y > 5000) ||
          (rooms[rm].projectiles[id].x < -5000) || (rooms[rm].projectiles[id].y < -5000)) {
          delBullet = true;
      }
      if(delBullet == true){
        deleteBullet(id, rm);
      }
    }
  }
}

// function deleteBullet(id) {
//   var temp = projectiles[bulletCount -= 1];
//   projectiles[bulletCount] = projectiles[id];
//   projectiles[id] = temp;
//   projectiles[bulletCount] = 0;
//   projectiles.numProjectiles -= 1;
// }

function deleteBullet(id, rm) {
  var temp = rooms[rm].projectiles[rooms[rm].bulletCount -= 1];
  rooms[rm].projectiles[rooms[rm].bulletCount] = rooms[rm].projectiles[id];
  rooms[rm].projectiles[id] = temp;
  rooms[rm].projectiles[rooms[rm].bulletCount] = 0;
  rooms[rm].projectiles.numProjectiles -= 1;
}


// //Move enemies towards the nearest player
// function moveEnemies() {
//    //Enemy movement handler
//    for (var id in enemies) {
//     //Find closest players
//     if ( players.numPlayers > 0 ) {
//     // if ( (players.numPlayers > 0) && (enemies.numEnemies > 0) ) {
//       var closestPlayer;
//       var closestPlayerDistance = Infinity;
//       for (var player in players) {
//         var distX = players[player].x - enemies[id].x;
//         var distY = players[player].y - enemies[id].y;
//         var distance = Math.sqrt( distX * distX + distY * distY );
//         if (distance < closestPlayerDistance) {
//           closestPlayer = player;
//           closestPlayerDistance = distance;
//         }
//       }
//       if (players[closestPlayer] == undefined) {
//         console.log("players[closestPlayer] is undefined. Ignoring",
//           "moveEnemies() logic instead of letting program crash.",
//           "Please check the logic.");
//         return;
//       }
//       //Move to closest player
//       distX = enemies[id].x - players[closestPlayer].x;
//       distY = enemies[id].y - players[closestPlayer].y;

//       var attackTheta = Math.atan(distX / distY);

//       var sign = -1;
//       if (enemies[id].y < players[closestPlayer].y) {
//         sign = 1;
//       }

//       if ( Math.abs(distX) < 12 && Math.abs(distY) < 12 ) {
//         // console.log("distX ", distX, "distY, ", distY);
//         //Deplete health
//         players[closestPlayer].health -= .05;
//         //Kill player
//         // if (players[closestPlayer].health < 0) {
//         //   players[closestPlayer] = 0;
//         //   players.numPlayers -= 1;
//         // }

//         //Dont move any closer
//         sign = 0;
//       }

//       enemies[id].vx =  enemies[id].speed * Math.sin(attackTheta) * sign;
//       enemies[id].vy =  enemies[id].speed * Math.cos(attackTheta) * sign;
//       var originX = enemies[id].x;
//       var originY = enemies[id].y;
//       enemies[id].x += enemies[id].vx;
//       enemies[id].y += enemies[id].vy;
//       if(hasCollision(enemies[id].x, enemies[id].y)){
//         enemies[id].x = originX;
//         enemies[id].y = originY;
//       }
//     }
//   }
// }

//Move enemies towards the nearest player
function moveEnemies(rm) {
  //Enemy movement handler
  for (var id in rooms[rm].enemies) {
   //Find closest players
   if ( rooms[rm].players.numPlayers > 0 ) {
   // if ( (players.numPlayers > 0) && (enemies.numEnemies > 0) ) {
     var closestPlayer;
     var closestPlayerDistance = Infinity;
     for (var player in rooms[rm].players) {
       var distX = rooms[rm].players[player].x - rooms[rm].enemies[id].x;
       var distY = rooms[rm].players[player].y - rooms[rm].enemies[id].y;
       var distance = Math.sqrt( distX * distX + distY * distY );
       if (distance < closestPlayerDistance) {
         closestPlayer = player;
         closestPlayerDistance = distance;
       }
     }
     if (rooms[rm].players[closestPlayer] == undefined) {
       console.log("players[closestPlayer] is undefined. Ignoring",
         "moveEnemies() logic instead of letting program crash.",
         "Please check the logic.");
       return;
     }
     //Move to closest player
     distX = rooms[rm].enemies[id].x - rooms[rm].players[closestPlayer].x;
     distY = rooms[rm].enemies[id].y - rooms[rm].players[closestPlayer].y;

     var attackTheta = Math.atan(distX / distY);

     var sign = -1;
     if (rooms[rm].enemies[id].y < rooms[rm].players[closestPlayer].y) {
       sign = 1;
     }

     if ( Math.abs(distX) < 12 && Math.abs(distY) < 12 ) {
       // console.log("distX ", distX, "distY, ", distY);
       //Deplete health
       rooms[rm].players[closestPlayer].health -= .05;
       //Kill player
       // if (players[closestPlayer].health < 0) {
       //   players[closestPlayer] = 0;
       //   players.numPlayers -= 1;
       // }

       //Dont move any closer
       sign = 0;
     }

     rooms[rm].enemies[id].vx =  rooms[rm].enemies[id].speed * Math.sin(attackTheta) * sign;
     rooms[rm].enemies[id].vy =  rooms[rm].enemies[id].speed * Math.cos(attackTheta) * sign;
     var originX = rooms[rm].enemies[id].x;
     var originY = rooms[rm].enemies[id].y;
     rooms[rm].enemies[id].x += rooms[rm].enemies[id].vx;
     rooms[rm].enemies[id].y += rooms[rm].enemies[id].vy;
     if(hasCollision(rooms[rm].enemies[id].x, rooms[rm].enemies[id].y, rm)){
       rooms[rm].enemies[id].x = originX;
       rooms[rm].enemies[id].y = originY;
     }
   }
 }
}

// //Handles bullet collisions
// function handleBulletCollisions() {
//   //Player-projectile collision handler
//   for (var player in players) {
//     for (var id in projectiles) {
//       if (projectiles[id]) {
//         if ( (Math.abs(players[player].x - projectiles[id].x) < 2) &&
//             (Math.abs(players[player].y - projectiles[id].y) < 2) ) {
//           players[player].health -= 1;
//           // if (players[player].health < 0) {
//           //   players[player] = 0;
//           //   players.numPlayers -= 1;
//           // }
//         }
//       }
//     }
//   }
//   //Enemy-projectile collision handler
//   for (var enemy in enemies) {
//     for (var id in projectiles) {
//       if (projectiles[id]) {
//         if ( (Math.abs(enemies[enemy].x - projectiles[id].x) < 5) &&
//             (Math.abs(enemies[enemy].y - projectiles[id].y) < 5) ) {
//               enemies[enemy].health -= 1;
//               if (enemies[enemy].health < 0) {
//                 var temp = enemies[enemyID -= 1];
//                 enemies[enemyID] = enemies[enemy];
//                 enemies[enemy] = temp;
//                 enemies[enemyID] = 0;
//                 enemies.numEnemies -= 1;
//               }
//         }
//       }
//     }
//   }
// }

//Handles bullet collisions
function handleBulletCollisions(rm) {
  //Player-projectile collision handler
  for (var player in rooms[rm].players) {
    for (var id in rooms[rm].projectiles) {
      if (rooms[rm].projectiles[id]) {
        if ( (Math.abs(rooms[rm].players[player].x - rooms[rm].projectiles[id].x) < 2) &&
            (Math.abs(rooms[rm].players[player].y - rooms[rm].projectiles[id].y) < 2) ) {
          rooms[rm].players[player].health -= 1;
          // if (players[player].health < 0) {
          //   players[player] = 0;
          //   players.numPlayers -= 1;
          // }
        }
      }
    }
  }
  //Enemy-projectile collision handler
  for (var enemy in rooms[rm].enemies) {
    for (var id in rooms[rm].projectiles) {
      if (rooms[rm].projectiles[id]) {
        if ( (Math.abs(rooms[rm].enemies[enemy].x - rooms[rm].projectiles[id].x) < 5) &&
            (Math.abs(rooms[rm].enemies[enemy].y - rooms[rm].projectiles[id].y) < 5) ) {
              rooms[rm].enemies[enemy].health -= 1;
              if (rooms[rm].enemies[enemy].health < 0) {
                var temp = rooms[rm].enemies[rooms[rm].enemyID -= 1];
                rooms[rm].enemies[rooms[rm].enemyID] = rooms[rm].enemies[enemy];
                rooms[rm].enemies[enemy] = temp;
                rooms[rm].enemies[rooms[rm].enemyID] = 0;
                rooms[rm].enemies.numEnemies -= 1;
              }
        }
      }
    }
  }
}


//Sets a disconnecting players online status to false
function logOutPlayer(uname) {
  console.log(`Logging out ${uname}`);
  pool.query(
  'SELECT online FROM account WHERE username=$1',[uname], (error,results)=>{
    if (error) {
      throw(error);
    }

    var result = (results.rows == '') ? '':results.rows[0].online;
      //Upade online status
      pool.query(
        'UPDATE account SET online = false WHERE username=$1',[uname], (error,results)=>{
          if (error) {
            throw(error);
          }
      });
    console.log(`Succesfully logged out ${uname}`);
  });
}

//=============================================================================
// Fazal Workspace
// Settings page
// app.get('/', function(request, response)
// {
//    var message ={'message':''};
//    response.render('settings/options.html',message);
// });

// // Enemy moves towards player while avoiding an obstacle
// // Calculate vector between player and target


// // // Enemy moves towards player while avoiding an obstacle
// // // Calculate vector between player and target
// var toPlayerX = playerPosX - enemyPosX;
// var toPlayerY = playerPosY - enemyPosY;

// // // Calculate vector between mouse and target
// var toMouseX = mousePosX - enemyPosX;
// var toMouseY = mousePosY - enemyPosY;

// // // Calculate distance between player and enemy, mouse and enemy
// var toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
// var toMouseLength = Math.sqrt(toMouseX * toMouseX + toMouseY * toMouseY);

// // // Normalize vector player
// toPlayerX = toPlayerX / toPlayerLength;
// toPlayerY = toPlayerY / toPlayerLength;

// // // Normalize vector mouse
// toMouseX = toMouseX / toMouseLength;
// toMouseY = toMouseY / toMouseLength;

// // // Move enemy torwards player
// enemyPosX += toPlayerX * speed;
// enemyPosY += toPlayerY * speed;

// // // Move enemy away from obstacle (a bit slower than towards player)
// enemyPosX -= toMouseX * (speed * 0.4);
// enemyPosY -= toMouseY * (speed * 0.4);


//Function to return a vector from one point to the next
// Code is in ES6(a js framework)
// fx, fy is from coordinate
// tx, ty is to coordinate
// function getNormVec(fx, fy, tx, ty){
//   var x = tx - fx;  // get differance
//   var y = ty - fy;
//   var dist = Math.sqrt(x * x + y * y); // get the distance.
//   x /= dist;  // normalised difference
//   y /= dist;
//   return {x,y};
// }

// var myObj = {}
// var myTarget = {};
// var myBullet = {}
// myObj.x = 100;
// myObj.y = 100;
// myTarget.x = 1000
// myTarget.y = 1000

// var vecToTag = getNormVect(myObj.x, myObj.y, myTarget.x, myTarget.y);
// myBullet.nx = vecToTag.x; // set bullets direction vector
// myBullet.ny = vecToTag.y;
// myBullet.x = myObj.x; // set the bullet start position.
// myBullet.y = myObj.y;
// myBullet.speed = 5; // set speed 5 pixels per frame

// myBullet.x += myBullet.nx * myBullet.speed;
// myBullet.y += myBullet.ny * myBullet.speed;



    // for (i = 0; i < 100; i ++) {
    //   players[socket.id].x -= .2;
    //   players[socket.id].y -= .2;
    // }


    // projectiles.numProjectiles = bulletCount;
    // bulletCount += 1;
    // projectiles[bulletCount] = {
    //   x: 300,
    //   y: 300,
    //   projectileSpeed: 1
    // };
    // shot = projectiles[bulletCount];
    // while (shot.x < 1000 && shot.y < 1000) {
    //   shot.x += shot.projectileSpeed;
    //   shot.y += shot.projectileSpeed;
    //     // console.log("[" + data.x + ", " + data.y + "]");
    //   if (shot.x == 1000 || shot.y == 1000) {
    //     projectiles[bulletCount] = 0;
    //   }
    // }




  // var player = players[socket.id] || {};

  //   // Handles player damage - at health <= 0, player is removed
  //   if (data.shoot) {
  //     player.health -= .2;
  //     if (player.health <= 0) {
  //       players[socket.id] = 0;
  //       players.numPlayers -= 1;
  //     }
  //   }

// var stageWidth = 1000;
// var stageHeight = 1000;

// var enemies = [];

// var enemyWidth = 50;
// var enemyHeight = 100;

// function spawnEnemy(){

//     //console.log('Spawn a new enemy!');

//     // Generate a random x position.
//     var randomXPosition = Math.floor(Math.random() * (stageWidth - enemyWidth)) + 1;

//     // Generate a random y position.
//     var randomYPosition = Math.floor(Math.random() * (stageHeight - enemyHeight)) + 1;

//     //Create a new Enemy instance and use above coordinates to place it in a random spot.
//     //Fill the rest of this object like we did with var bullet = {...}.
//     var newEnemy = {
//         xPosition: randomXPosition,
//         yPosition: randomYPosition,
//     };

//     // Push new enemy in the enemies array so we can render them all at once in the draw loop.
//     enemies.push(newEnemy);
// }



// //This function will run 'spawnEnemy()' every 'intervalInMilliSeconds'.
// setInterval(spawnEnemy);

// setInterval(function(){
//   io.sockets.emit('enemyState', enemies);
// }, 1000 / 120);

//=============================================================================

//=============================================================================
// Hailey Workpace
/*Guide to accessing map data:
1. Walls: objects that has x, y, width, height, texture.
2. Furnitures: objects that has names, x, y, direction.
3. Enemies, bullets, players: will think about this tomorrow

console.log( mapData.walls[2].x );
-->prints the x-axis of mapData's wall's 3rd element.

console.log(mapData.furnitures[4].name );
-->prints the x-axis of mapData's wall's 5th element.
*/

//
// var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap.json', 'utf8'));
// var processor = require('./static/objects/mapProcessor.js');
// mapData = processor.constructFromData(mapDataFromFile);
// console.log(JSON.stringify(mapData));




// processor.constructFromData(initialData);

//=============================================================================




//=============================================================================
// Long Workpace
//Parse URL-encoded bodies (sent by HTML form)
app.use(express.urlencoded({extended:false}));
//Parse JSON body( sent by API client)
app.use(express.json());

//home page
app.get('/', function(request, response)
{
   var message ={'message':''};
   response.render('pages/login',message);
});

//Login function
app.post('/checkAccount', (request, response)=>{
  var uname = request.body.username;
  var pw = request.body.password;

  //Admin user
  if (uname == "ADMIN301254694") {
    pool.query('SELECT password FROM account WHERE username=$1',[uname], (error,results)=>{
      if (error) {
        throw(error);
      }
      //Check for password match
      var result = (results.rows == '') ? '':results.rows[0].password;
      if (result == String(pw)) {
        //Password matched, extract all table information
        pool.query("SELECT * FROM account;", (error,results) => {
          if (error) {
            throw(error);
          }
          var results = {'rows': results.rows };
          response.render('pages/admin', results);
        });
      }
      //Password does not match
      else {
        var message ={'message':'Account is not existing'};
        response.render('pages/login', message);
      }
    });
  }
  else {
   pool.query(
     'SELECT password, online FROM account WHERE username=$1',[uname], (error,results)=>{
       if (error)
       {
         throw(error);
       }

       var result = (results.rows == '') ? '':results.rows[0].password;
       if (result == String(pw))
       {
         //If user already online, reject login attempt
         if (results.rows[0].online) {
          console.log("Redundant login attempt for user $1", [uname]);
          var message ={'message':'Account is already logged in!'};
          response.render('pages/login',message);
         }
         var user = {'username':uname};

        //Upade online status
        pool.query(
          'UPDATE account SET online = true WHERE username=$1',[uname], (error,results)=>{
            if (error)
            {
              throw(error);
            }
        });
        //Log in user
        // response.render('pages/index', user);
        response.render('pages/matchmaking', user);
       }
       else {
        var message ={'message':'Account is not existing'};
        response.render('pages/login', message);
       }
     });
  }
});

//Cheking gmail data with database
app.post('/gglogin', (request, response)=>{
  const uname = request.body.username;
  const gmail=request.body.gmail;
  const searchQuery = "SELECT * FROM account WHERE gmail=$1";
  pool.query(searchQuery,[gmail], (error,results) =>{
    if (error){
      throw(error);
    }
    if (results.rows!='')
    {
      if (results.rows[0].username != uname)
      {
        var message = 'Gmail is used';
        response.render('pages/login',message);
      }
    }
    if (results.rows=='')
    {
      console.log('Creating new account with Google');
      const createQuery = "INSERT INTO account (username,gmail) VALUES($1,$2)";
      pool.query(createQuery,[uname,gmail], (error,results)=>{
      if (error)
        throw(error);
      });
    }
    response.end();
  });

});
//Login with gmail
app.post('/ggAccount',(request,response)=>
{
  const uname = request.body.username;
  const user = {
    'username':uname
  };
  const query = "SELECT * FROM account WHERE username =$1";
  pool.query(query,[uname],(error, results)=>{
    if (error)
      throw (error);
    if (results.rows[0].online)
    {
      console.log("Redundant login attempt for user $1", [uname]);
      var message ={'message':'Account is already logged in!'};
     response.render('pages/login',message);
      // response.send(uname+ ' is online already');
    }
    else
      {
        //Upade online status
        pool.query(
          'UPDATE account SET online = true WHERE username=$1',[uname], (error,results)=>{
            if (error)
            {
              throw(error);
            }
        });
       response.render('pages/index',user);
        // response.send('Login successfully for'+uname);
      }
  });

});

//sign-up page
app.get('/register', function(request,response)
{
  var message ={'message':''};
  response.render('pages/register',message);
});

app.post('/register', (request,response)=>{
   const uname = request.body.username;
   const pw = request.body.pw;
   const gmail = request.body.gmail;

   //Check username availability
   console.log('CHECKING USERNAME');
   var text = `SELECT * FROM account WHERE username='${uname}';`;
   pool.query(text,(error,results)=>{
     if (error){
       throw (error);
     }
     else {
       var result = {'rows': results.rows};
       if (result.rows.length !=0)
       {
         var message = {'message':'Username is used'};
         console.log('USERNAME IS USED');
         response.render('pages/register',message);
       }
       else {
         console.log('USERNAME CHECKED');
         //Check gmail availability
         console.log('CHECKING GMAIL');
         var text = `SELECT * FROM account WHERE gmail='${gmail}';`;
         pool.query(text,(error, results)=>{
           if (error){
             throw(error);
           }
           else {
             var result2 = {'rows': results.rows};
             if (result2.rows.length !=0)
             {
               var message = {'message':'Gmail is used'}
               console.log('GMAIL IS USED');
               response.render('pages/register',message);
             }
             else {
               console.log('GMAIL CHECKED');
               console.log('INSERTING...')
               var text = `INSERT INTO account (username, password, gmail)
                 VALUES ('${uname}','${pw}','${gmail}');`;
               pool.query(text, (error, results) =>{
                 if (error){
                   response.end(error);
                 };
                 console.log("INSERT ACCOUNT COMPLETED");
                 var message = {'message':'Sign-up Completed'};
                 response.render('pages/login',message)
               });
             };
           };
         });
       }
     };
   });
});
//=============================================================================

//=============================================================================
// George Workpace
app.post('/logout', (request, response)=>{
  console.log("logging username on logout request", request.body.username);
  logOutPlayer(request.body.username);
  response.render('pages/login', {'message':'Please play again!'} );
});

app.post('/gameroom', (request, response)=>{
  var data = {"server": request.body.roomName, "user": request.body.uname};
  console.log("logging results", data)
  response.render('pages/index', data);
});

//=============================================================================



//=============================================================================
// Josh Workpace

//=============================================================================
