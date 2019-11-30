var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var startX = 0;
var startY = 0;
var canvasW = 800;
var canvasH = 600;
canvas.width = canvasW;
canvas.height = canvasH;

var img = new Image();
img.src = "/static/objects/player1.jpg";
img.onload = function () {
    context.drawImage(img, 75, 55, 150, 110);
}
