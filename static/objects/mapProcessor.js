const fs = require('fs');
//when accessing classes in objects, call: objects.<OBJECTNAME>(<parameters>)
var objects = require('./MapObject.js');

// Process JSON files into 2d array of map objects
// code for calling this function [in index.js]
var constructFromData = function(jsonContent){
  var largestPosition = findLargestPosition(jsonContent);
  var mapData = giveEmptyMap(largestPosition);
  mapData = initWallMap(mapData, jsonContent);
  //NEED more functions here for other objects
  return mapData;
}

//// Support functions
function findLargestPosition(json){
  var largestX = 0;
  var largestY = 0;

  for (var i = 0; i < json.map.wall.length; i++) {
    var x = json.map.wall[i].x;
    var y = json.map.wall[i].y;
    var width = json.map.wall[i].width;
    var height = json.map.wall[i].height;
    var lastX = x + width - 1;
    var lastY = y + height - 1;
    if(lastX > largestX){
      largestX = lastX;
    }
    if(lastY > largestY){
      largestY = lastY
    }
    //console.log(obj.name);
  }
  // console.log("Largest position: " + largestX + ", " + largestY);///****
  return [largestX, largestY];
}

function giveEmptyMap(largestPosition){
  var mapData = [];
  // console.log("Creating empty mapData")////******
  for (var x = 0; x < (largestPosition[0] + 1); x++){
    mapData[x] = [];
  	for (var y = 0; y < (largestPosition[1] + 1); y++){
      	mapData[x][y] = '';
        // console.log("\tMapdata[" + x + "][" + y + "]"); ////*****
    }
  }
  return mapData;
}

function initWallMap(mapData, json){
  for (var i = 0; i < json.map.wall.length; i++) {
    var x = json.map.wall[i].x;
    var y = json.map.wall[i].y;
    var width = json.map.wall[i].width;
    var height = json.map.wall[i].height;
    mapData = insertWallIntoArray(mapData, x, y, width, height);
  }
  return mapData;
}

function insertWallIntoArray(mapData, x, y, width, height){
  var endX = x + width;
  var endY = y + height;
  for (var mapX = x; mapX < endX; mapX++){
    for (var mapY = y; mapY < endY; mapY++){
      mapData[mapX][mapY] = new objects.Wall();
    }
  }

  // ////****display
  // for (var mapY = 0; mapY < mapData[mapData.length - 1].length; mapY++){
  //   var line = "";
  // 	for (var mapX = 0; mapX < mapData.length; mapX++){
  //     if (mapData[mapX][mapY] == ''){
  //       line += "0";
  //     }else if(mapData[mapX][mapY].name == "wall"){
  //       line += "1";
  //     }else{
  //       line += "!";
  //     }
  //   }
  //   console.log(line);
  // }
  // /////*****
  return mapData;
}

function giveWallArray(json){
  var array = [];
  for (var i = 0; i < json.map.wall.length; i++) {
    var x = json.map.wall[i].x;
    var y = json.map.wall[i].y;
    var width = json.map.wall[i].width;
    var height = json.map.wall[i].height;
    var obj = new objects.Wall(x, y, width, height);
    //console.log(obj.name);
    array.push(obj);
  }
  return array;
}

function giveFurnitureArray(json){
  //same as giveWallArray()
  var array = [];
  return array;
}

function giveEnemyArray(json){
  //same as giveWallArray()
  var array = [];
  return array;
}

function givePlayerArray(json){
  //same as giveWallArray()
  var array = [];
  return array;
}
module.exports.constructFromData = constructFromData;
