var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);
var wsOpen = false;

var gameState = null;

ws.onmessage = function (event) {
    gameState = JSON.parse(event.data);
};
ws.onopen = function () {
    wsOpen = true;
};
ws.onclose =function () {
    wsOpen = false;
};

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var backgroundPatternWidth = 20;
var backgroundPatternHeight = 20;
var backgroundPattern = createBackgroundPattern();

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

    var deltaFromCentre = {
        x: mousePos.x - centerX,
        y: mousePos.y - centerY
    };

    if (wsOpen) {
        ws.send(JSON.stringify(deltaFromCentre));
    }
}, false);

function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState != null) {
        drawBackground(gameState.myBlobby);
        for (var i = 0; i < gameState.blobbies.length; i++) {
            drawBlobby(gameState.myBlobby, gameState.blobbies[i]);
        }
        drawBlobby(gameState.myBlobby, gameState.myBlobby);
    }

    requestAnimFrame(function() {
        animate();
    });
}

function drawBlobby(myBlobby, blobby) {
    var viewPortLeft = myBlobby.x - centerX;
    var viewPortTop = myBlobby.y - centerY;

    var offsetX = blobby.x - viewPortLeft;
    var offsetY = blobby.y - viewPortTop;

    context.beginPath();
    context.arc(offsetX, offsetY, blobby.radius, 0, 2 * Math.PI, false);
    context.fillStyle = blobby.colour;
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

function drawBackground(myBlobby) {
    var viewPortLeft = myBlobby.x - centerX;
    var viewPortTop = myBlobby.y - centerY;

    var offsetX = viewPortLeft % backgroundPatternWidth;
    var offsetY = viewPortTop % backgroundPatternHeight;

    context.translate(-offsetX, -offsetY);

    context.fillStyle = backgroundPattern;
    context.fillRect(0, 0, canvas.width + backgroundPatternWidth, canvas.height + backgroundPatternHeight);
    context.fill();

    context.translate(offsetX, offsetY);
}

animate();