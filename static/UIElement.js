var socket = io();
class UIElement{
  constructor(x, y, width, height, hasTexture, textureSrc, color, name, clickable){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hasTexture = hasTexture;
    this.textureSrc = textureSrc;
    this.color = color;
    this.name = name ;
    this.clickable = clickable;
  }
}

class Ready extends UIElement{
  constructor(x, y, width, height, color){
    super(x, y, width, height, false, null, color, "UNREADY", true);
    this.ready = false;
  }
  interaction(){//temporary
    socket.emit('ready');
    if(this.name == "UNREADY"){
      this.name = "READY"
    }else if(this.name == "READY"){
      this.name = "UNREADY"
    }else{
      console.log("ready button: " + this.name)
    }
  }
}

class Teammate extends UIElement{
  constructor(userName, x, y, width, height, color){
    super(x, y, width, height, false, null, color, "Teammate", true);
    this.userName = userName;
  }
  interaction(){
    alert("Player: " + this.userName)//temporary
  }
}

class CreateRoom extends UIElement{
  constructor(x, y, width, height, color, socket){
    super(x, y, width, height, false, null, color, "Create Room", true, socket);
    // this.sock = socket;
  }
  interaction(){
    var roomName = prompt("Room name: ","")
    socket.emit('create room', roomName);
  }
}

class GlobalPlayer extends UIElement{
  constructor(userName, x, y, width, height, color){
    super(x, y, width, height, false, null, color, "Global Player", true);
    this.userName = userName;
  }
  interaction(){
    alert("Player: " + this.userName)//temporary
  }
}
