var util = require('util');
var EventEmitter = require('events').EventEmitter;

var worldWidth = 1000;
var worldHeight = 1000;

function Blobby(id, x, y, size, colour) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
    this.colour = colour;

    this.getSpeed = function() {
        return size / 5;
    };
}

function GameEngine() {

    EventEmitter.call(this);

    var mousePoses = [];

    var gameState = {
        blobbies: []
    };

    gameState.blobbies.push(new Blobby(-1, 20, 20, 5, 'yellow'));
    gameState.blobbies.push(new Blobby(-1, 400, 400, 5, 'red'));
    gameState.blobbies.push(new Blobby(-1, 380, 600, 2, 'blue'));

    var started = false;

    this.updateMousePos = function(newMousePos, id) {
        mousePoses[id] = newMousePos;
    };

    this.ensureStarted = function() {
        if (!started) {
            console.log("Starting game engine");

            started = true;
            this.gameLoop();
        }
    };

    this.addBlobby = function(id) {
        gameState.blobbies.push(new Blobby(id, 500, 500, 15, 'green'));
    };

    this.removeBlobby = function(id) {
        for (var i = gameState.blobbies.length - 1; i >= 0; i--) {
            if (gameState.blobbies[i].id === id) {
                gameState.blobbies.splice(i, 1);
                return;
            }
        }
    };

    this.createMyState = function(id) {
        var gameStateForId = {
            blobbies: [],
            myBlobby: null
        };

        for (var i = 0; i < gameState.blobbies.length; i++) {
            if (gameState.blobbies[i].id === id) {
                gameStateForId.myBlobby = gameState.blobbies[i];
            } else {
                gameStateForId.blobbies.push(gameState.blobbies[i]);
            }
        }
        return gameStateForId;
    };

    this.gameLoop = function() {
        updateBlobbies();
        this.emit("gameStateUpdated", gameState);

        var self = this;
        setTimeout(function() {
            self.gameLoop();
        }, 1000/60);
    };

    function updateBlobbies() {
        for (var i = 0; i < gameState.blobbies.length; i++) {
            var mousePos = mousePoses[gameState.blobbies[i].id];
            if (mousePos != undefined) {
                updateBlobby(mousePos, gameState.blobbies[i]);
            }
        }
    }

    function updateBlobby(mousePos, blobby) {
        var unitVector = calculateUnitVectorFromOrigin(mousePos);

        var speed = blobby.getSpeed();
        var vector = {
            x: unitVector.x * speed,
            y: unitVector.y * speed
        };

        if ((mousePos.x > 5) && (blobby.x < worldWidth)) {
            blobby.x += vector.x;
        } else if ((mousePos.x < -5) && (blobby.x > 0)) {
            blobby.x += vector.x;
        }

        if ((mousePos.y > 5) && (blobby.y < worldHeight)) {
            blobby.y += vector.y;
        } else if ((mousePos.y < -5) && (blobby.y > 0)) {
            blobby.y += vector.y;
        }
    }

    function calculateUnitVectorFromOrigin(point) {
        return calculateUnitVector({
            x: 0,
            y: 0
        }, point);
    }

    function calculateUnitVector(pointA, pointB) {
        var vector = {
            x: pointB.x - pointA.x,
            y: pointB.y - pointA.y
        };

        var magnitude = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));

        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    }
}

util.inherits(GameEngine, EventEmitter);

module.exports = GameEngine;