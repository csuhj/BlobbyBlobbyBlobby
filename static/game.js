var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
var wsOpen = false;
ws.onmessage = function (event) {
    document.querySelector('#mousePosition').innerHTML = JSON.parse(event.data);
};
ws.onopen = function (event) {
    wsOpen = true;
};
ws.onclose =function (event) {
    wsOpen = false;
};

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var backgroundPatternWidth = 20;
var backgroundPatternHeight = 20;
var backgroundPattern = createBackgroundPattern();

var mouseX;
var mouseY;

var worldWidth = 1000;
var worldHeight = 1000;

var viewPortCenterX = worldWidth/2;
var viewPortCenterY = worldHeight/2;

var Blob = function(x, y, radius, colour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
};

var blobs = [];
blobs.push(new Blob(400, 400, 5, 'red'));
blobs.push(new Blob(380, 600, 2, 'blue'));

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
}, false);

function animate() {
    moveViewPort();

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    for (var i=0; i<blobs.length; i++) {
        drawBlob(blobs[i]);
    }
    drawBlob(new Blob(viewPortCenterX, viewPortCenterY, 15, 'green'));

    requestAnimFrame(function() {
        animate();
    });
}

function moveViewPort() {
    if ((mouseX > centerX + 5) && (viewPortCenterX < (worldWidth - centerX))) {
        viewPortCenterX += 1;
    } else if ((mouseX < centerX - 5) && (viewPortCenterX > centerX)) {
        viewPortCenterX -= 1;
    }

    if ((mouseY > centerY + 5) && (viewPortCenterY < (worldHeight - centerY))) {
        viewPortCenterY += 1;
    } else if ((mouseY < centerY - 5) && (viewPortCenterY > centerY)) {
        viewPortCenterY -= 1;
    }

    if (wsOpen) {
        ws.send(viewPortCenterX + ', ' + viewPortCenterY);
    }
}

function drawBlob(blob) {
    var viewPortLeft = viewPortCenterX - centerX;
    var viewPortTop = viewPortCenterY - centerY;

    var offsetX = blob.x - viewPortLeft;
    var offsetY = blob.y - viewPortTop;

    context.beginPath();
    context.arc(offsetX, offsetY, blob.radius, 0, 2 * Math.PI, false);
    context.fillStyle = blob.colour;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
}

function createBackgroundPattern() {
    var canvasPattern = document.createElement("canvas");
    canvasPattern.width = backgroundPatternWidth;
    canvasPattern.height = backgroundPatternHeight;
    var contextPattern = canvasPattern.getContext("2d");

    contextPattern.beginPath();
    contextPattern.strokeStyle = '#BBBBBB';
    contextPattern.strokeRect(0.5, 0.5, backgroundPatternWidth, backgroundPatternHeight);
    contextPattern.stroke();

    return context.createPattern(canvasPattern,"repeat");
}

function drawBackground() {
    var viewPortLeft = viewPortCenterX - centerX;
    var viewPortTop = viewPortCenterY - centerY;

    var offsetX = viewPortLeft % backgroundPatternWidth;
    var offsetY = viewPortTop % backgroundPatternHeight;

    context.translate(-offsetX, -offsetY);

    context.fillStyle = backgroundPattern;
    context.fillRect(0, 0, canvas.width + backgroundPatternWidth, canvas.height + backgroundPatternHeight);
    context.fill();

    context.translate(offsetX, offsetY);
}

animate();