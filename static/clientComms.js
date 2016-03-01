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
            if (gameState.food[j].playerId === gameStateDelta.foodDelta.eatenFood[i]) {
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

var latestMousePos = { x: 0, y: 0 };
var lastSentMousePosRelativeToCentre = { x: 0, y: 0 };
var spacebarPressed = false;

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

function sendMousePos(mousePosRelativeToCentre) {

    if (wsOpen && (lastSentMousePosRelativeToCentre.x != mousePosRelativeToCentre.x || lastSentMousePosRelativeToCentre.y != mousePosRelativeToCentre.y)) {
        var clientState = {
            mousePos: mousePosRelativeToCentre
        }

        ws.send(JSON.stringify(clientState));

        lastSentMousePosRelativeToCentre = mousePosRelativeToCentre;
    }
}

function sendSpacebarPressed() {

    if (wsOpen && spacebarPressed) {
        var clientState = {
            requestedAction: 'split'
        }

        ws.send(JSON.stringify(clientState));

        spacebarPressed = false;
    }
}

canvas.addEventListener('mousemove', function(evt) {
    latestMousePos = getMousePos(canvas, evt);
}, false);

document.body.addEventListener('keyup', function(evt) {
    spacebarPressed = evt.keyCode == 32;
}, false);

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
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

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

gameFrame = function () {
}

function updateName(name) {
    var clientState = {
        name: name,
        isGhost: false
    }

    if (wsOpen) {
        ws.send(JSON.stringify(clientState));
    }
}

function updateColour(colour) {
    var clientState = {
        colour: colour,
        isGhost: false
    }

    if (wsOpen) {
        ws.send(JSON.stringify(clientState));
    }
}

function requestSplit() {
    var clientState = {
        requestedAction: 'split',
        isGhost: false
    }

    if (wsOpen) {
        ws.send(JSON.stringify(clientState));
    }
}


function animate() {
    try {
        gameFrame();
    } catch (e) {
        document.getElementById('errorMessages').innerHTML = e.message;
    }

    requestAnimFrame(function() {
        animate();
    });
}

animate();