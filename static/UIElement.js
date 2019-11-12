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
    super(x, y, width, height, false, null, color, "READY", true);
    this.ready = false;
  }
  interaction(){//temporary
    if(!this.ready){
      this.ready = true
      alert("player ready")
    }else{
      this.ready = false;
      alert("player unready")
    }
  }
}

class PlayerBox extends UIElement{
  constructor(userName, x, y, width, height, color){
    super(x, y, width, height, false, null, color, "Player", true);
    this.userName = userName;
  }
  interaction(){
    alert("Player: " + this.userName)//temporary
  }
}
