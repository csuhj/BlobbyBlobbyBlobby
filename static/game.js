var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);
var wsOpen = false;

var gameState = {
    food: [],
    players: [],
    me: null
};

ws.onmessage = function (event) {
    var gameStateDelta = JSON.parse(event.data);

    for (var i = 0; i < gameStateDelta.foodDelta.newFood.length; i++) {
        gameState.food.push(gameStateDelta.foodDelta.newFood[i]);
    }

    for (var i = 0; i < gameStateDelta.foodDelta.eatenFood.length; i++) {
        for (var j = gameState.food.length - 1; j >= 0; j--) {
            if (gameState.food[j].id === gameStateDelta.foodDelta.eatenFood[i]) {
                gameState.food.splice(j, 1);
            }
        }
    }

    gameState.players = gameStateDelta.players;
    gameState.me = gameStateDelta.me;
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

    if ((gameState != null) && (gameState.me != null)) {
        drawBackground(gameState.me);
        for (var i = 0; i < gameState.food.length; i++) {
            drawBlobby(gameState.me, gameState.food[i]);
        }
        for (var i = 0; i < gameState.players.length; i++) {
            drawBlobby(gameState.me, gameState.players[i]);
        }
        drawBlobby(gameState.me, gameState.me);
    }

    requestAnimFrame(function() {
        animate();
    });
}

function drawBlobby(me, blobby) {
    var viewPortLeft = me.x - centerX;
    var viewPortTop = me.y - centerY;

    var offsetX = blobby.x - viewPortLeft;
    var offsetY = blobby.y - viewPortTop;

    context.beginPath();
    context.arc(offsetX, offsetY, blobby.size, 0, 2 * Math.PI, false);
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

function drawBackground(me) {
    var viewPortLeft = me.x - centerX;
    var viewPortTop = me.y - centerY;

    var offsetX = viewPortLeft % backgroundPatternWidth;
    var offsetY = viewPortTop % backgroundPatternHeight;

    context.translate(-offsetX, -offsetY);

    context.fillStyle = backgroundPattern;
    context.fillRect(0, 0, canvas.width + backgroundPatternWidth, canvas.height + backgroundPatternHeight);
    context.fill();

    context.translate(offsetX, offsetY);
}

animate();