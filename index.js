
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


// var rooms[room];
// var room[socket.id];

app.use('/static', express.static(__dirname + '/static'));// Ring
// app.get('/', function(request, response) {
//   response.sendFile(path.join(__dirname, 'index.html'));
// });// Starts the server.
server.listen(PORT, function() {
  console.log('Starting server on port 5000');
});

//setting up default viewpath to views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Looking for static files in public folder
app.use(express.static(path.join(__dirname, 'public')));


var totalPlayers = 0;
var rooms = {};
var globalPlayers = {
  players : [],
};
var getRoomBySocketId = {};

io.on('connection', function(socket){/// needs function to remove globalPlayers/rooms elements when player disconnect
  var gameState = "menu"
  initConnection(socket);

  if(gameState == "menu"){
    var data = {
      totalPlayers,
      globalPlayers,
      rooms
    }
    mainMenuProcessor(socket, data);
  }else if(gameState == "game"){
    // console.log("gameState = " + gameState);
    inGameProcessor(socket, data);
  }
});

function initConnection(socket){
  console.log("connection : " + socket.id)
  totalPlayers++;
  console.log("totalPlayers : " + totalPlayers)
  if(totalPlayers > 0){
    globalPlayers.players.push(socket.id);
  }
  console.log(globalPlayers)
}

function mainMenuProcessor(socket, data){
  // var data = "placeholder"////temporary
  /// roomdata = current client room
  var globalData = {
    totalPlayers,
    globalPlayers
  }
  socket.emit('main menu');
  // socket.broadcast.emit('global', globalData);// emit without the sender
  io.sockets.emit('global', globalData);//emit to all clients
  // socket.emit('room', rooms);
  socket.on('create room', function(roomName){
    processCreateRoom(socket, roomName)
    io.to(roomName).emit('room data', rooms[roomName]);
  });

  socket.on('ready', function(){
    processPlayerReady(socket);
  });

}
//processCreateRoom(roomName);

function inGameProcessor(socket, data){
  socket.emit('in game');

}

function processCreateRoom(socket, roomName){
  socket.join(roomName);
  getRoomBySocketId[socket.id] = roomName;
  if(rooms[roomName] == undefined){
    rooms[roomName] = giveEmptyRoomData(roomName);
  }
  rooms[roomName].players[socket.id] = {};
  rooms[roomName].players.numPlayers++;

  console.log("rooms[roomName]: " + rooms[roomName])
  console.log("LOGGING ROOMS", rooms[roomName]);
}

function joinRoom(){

}


function giveEmptyRoomData() {
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

function processPlayerReady(socket){
  var roomName = getRoomBySocketId[socket.id];
  // var ready = rooms[roomName].players[socket.id].ready;
  if(rooms[roomName].players[socket.id].ready == undefined){
    rooms[roomName].players[socket.id].ready = true;
  }else if(rooms[roomName].players[socket.id].ready == true){
    rooms[roomName].players[socket.id].ready = false;
  }else{
    rooms[roomName].players[socket.id].ready = true;
  }
  console.log(socket.id + " ready: " + rooms[roomName].players[socket.id].ready)
  processStartGame(socket);
}

function processStartGame(socket){
  if(isGameStartable(socket)){
    console.log("process creating game map")
  }
}

function isGameStartable(socket){
  var roomName = getRoomBySocketId[socket.id];
  var playerList = rooms[roomName].players;
  for(var player in playerList){
    if(player.ready == false){
      return false;
    }else if(player.ready != true){
      console.log("Error in ready: " + player.ready)
      return false;
    }
  }
  return true;
}

function initLevel(roomName) {
  var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
  var processor = require('./static/objects/mapProcessor.js');
  rooms[roomName].mapData = processor.constructFromData(mapDataFromFile);
  //console.log(mapData);///////*******
  io.sockets.to(roomName).emit('create map', rooms[roomName].mapData);
  console.log('players.numPlayers: ', rooms[roomName].players.numPlayers, ', create map called');
}

function createInGamePlayer(id, serverName) {
  rooms[serverName].players.numPlayers += 1;
  rooms[serverName].players[id] = {
    userName: socket.id,
    x: 160 * GRID_SIZE,
    y: 59 * GRID_SIZE,
    healsth: 4.33,
    level: 1,
    damage: 5,
    speed: 3
  };
}


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

// var players = -1;
// console.log("  total players: " + players)
// var roomList = {};
// var latestRoom = 0;
// var latestPlayer = 0;
// io.on('connection', function(socket){
  //   players++;
  //   console.log("connection from: " + socket.id)
  //   console.log("  total players: " + players)
  //   socket.emit('global', players);
  //   socket.on('join room', function(){
    //     if(roomList[latestRoom] == undefined){
      //       roomList[latestRoom] = roomData()
      //       ////////////trying to create rooms with many players to see flow of socket
      //     }
      //     roomList[latestRoom].players[latestPlayer] = socket.id;
      //     socket.join(latestRoom)
      //     latestPlayer++;
      //     roomList[latestRoom].players.numPlayers++;
      //     if(roomList[latestRoom].length >= 4){
        //       latestRoom++;
        //     }
        //     console.log(roomList[latestRoom]);
        //     io.sockets.emit('room info', roomList);
        //     console.log(roomList[latestRoom].players.length)
        //     for(var i = 0; i < roomList[latestRoom].players.numPlayers; i++){
          //       var socketID  = roomList[latestRoom].players[i];
          //       console.log("\tsending to: " + socketID);
          //
          //       io.sockets.to(0).emit('player socket', socketID)
          //     }
          //   });
          // });
