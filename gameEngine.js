var util = require('util');
var EventEmitter = require('events').EventEmitter;

var worldWidth = 1000;
var worldHeight = 1000;

function Blobby(id, x, y, radius, colour) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
};

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
        }

        for (var i = 0; i < gameState.blobbies.length; i++) {
            if (gameState.blobbies[i].id === id) {
                gameStateForId.myBlobby = gameState.blobbies[i];
            } else {
                gameStateForId.blobbies.push(gameState.blobbies[i]);
            }
        }
        return gameStateForId;
    }

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
        if ((mousePos.x > 5) && (blobby.x < worldWidth)) {
            blobby.x += 1;
        } else if ((mousePos.x < -5) && (blobby.x > 0)) {
            blobby.x -= 1;
        }

        if ((mousePos.y > 5) && (blobby.y < worldHeight)) {
            blobby.y += 1;
        } else if ((mousePos.y < -5) && (blobby.y > 0)) {
            blobby.y -= 1;
        }
    }
}

util.inherits(GameEngine, EventEmitter);

module.exports = GameEngine;