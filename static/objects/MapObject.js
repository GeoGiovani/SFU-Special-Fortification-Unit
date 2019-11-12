/*Guide for adding classes to this file: [When not sure ask Hailey]
1. Add a function in the similar form as others.
    function NAME(parameters) {
      ...
    }
2. at the end of the file, add
    module.exports.NAME = NAME;
  (This is required when accessing these from other .js files)

When accessing these from other .js files:

1. link the file by
  var objFile = require('objects.js');
with appropriate path (and appropriate variable name)
2. call them as
  var wall1 = objFile.Wall(x, y, width, height, textureLink);

will create a variable 'wall1' constructed with class 'Wall'.
*/

class MapObject{
  constructor(name, collision, interaction, destruction, textureSrc){
    this.name = name;
    //boolean
    this.collision = collision;// check collision
    this.interaction = interaction;// check interactable
    this.destruction = destruction;// check destroyable
    //source
    this.textureSrc = textureSrc;
  }
}

//a general class for Surfaces such as wall, floor, grass, glasses,etc
class Wall extends MapObject{
  constructor(){
    var source = "/wall.png";//"../../public/image/wall.png";
    super("wall", true, false, false, source);
    //might have functions for interactions, destructions
  }
}

class Furniture extends MapObject{ // lets name this as furniture FOR NOW
  constructor(){
    var source = null;
    super("furniture", true, true, true, source);
    //default direction is facing south
    this.direction = 's';
  }
}


class Player {
  // var x;
  // var y;
  // var width;
  // var height;
  // var textureSrc;
  constructor(textureSrc){
    this.textureSrc = textureSrc;
  }
  changeTexture(textureSrc){
    this.textureSrc = textureSrc;
  }
}


//this is for using functions (classes) in other .js files.
// module.exports.Surface = Surface;
module.exports.MapObject = MapObject;
module.exports.Wall = Wall;
module.exports.Furniture = Furniture;


// Detailed definitions for: furnitures
