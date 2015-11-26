var util = require('util');
var EventEmitter = require('events').EventEmitter;

var worldWidth = 1000;
var worldHeight = 1000;
var minimumSizeDifferenceForEating = 3;

function Blobby(id, x, y, size, colour) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
    this.colour = colour;

    this.getSpeed = function() {
        return Math.max((30 - this.size) / 5, 1);
    };

    this.getArea = function() {
        return Math.PI * (this.size * this.size);
    };


    this.overlaps = function(blobby) {
        var vector = {
            x: blobby.x - this.x,
            y: blobby.y - this.y
        };

        var magnitude = Math.abs(calculateVectorMagnitude(vector));
        return magnitude < this.size + blobby.size;
    };

    this.isPlayer = function() {
        return id != "food";
    };

    this.increaseSize = function(blobby) {
        var area = this.getArea();
        var blobbyArea = blobby.getArea();

        this.size = Math.sqrt((blobbyArea + area) / Math.PI);
    };
}

function GameEngine() {

    EventEmitter.call(this);

    var mousePoses = [];

    var gameState = {
        blobbies: []
    };

    var running = false;
    var timeOfLastFood = new Date();

    this.updateMousePos = function(newMousePos, id) {
        mousePoses[id] = newMousePos;
    };

    this.addBlobby = function(id) {
        this.ensureStarted();
        gameState.blobbies.push(new Blobby(id, 500, 500, 15, 'green'));
    };

    this.removeBlobby = function(id) {
        var numberOfPlayers = 0;

        for (var i = gameState.blobbies.length - 1; i >= 0; i--) {
            if (gameState.blobbies[i].id === id) {
                gameState.blobbies.splice(i, 1);
            } else {
                if (gameState.blobbies[i].isPlayer()) {
                    numberOfPlayers++;
                }
            }
        }

        if (numberOfPlayers == 0) {
            stop();
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
        if ((new Date() - timeOfLastFood) > 5000) {
            addFoods(3);
        }

        this.emit("gameStateUpdated", gameState);

        var self = this;
        setTimeout(function() {
            if (running) {
                self.gameLoop();
            }
        }, 1000/60);
    };

    this.ensureStarted = function() {
        if (!running) {
            console.log("Starting game engine");

            reset();

            running = true;
            this.gameLoop();
        }
    };

    function stop() {
        if (running) {
            running = false;
            console.log("Stopped game engine");
        }
    }

    function reset() {
        mousePoses = [];

        gameState = {
            blobbies: []
        };

        addFoods(100);
    }

    function addFoods(n) {
        for (var i=0; i<n; i++) {
            addFood();
        }
    }

    function addFood() {
        var foodX = Math.floor(Math.random() * worldWidth);
        var foodY = Math.floor(Math.random() * worldHeight);
        gameState.blobbies.push(new Blobby("food", foodX, foodY, 5, 'yellow'));
        timeOfLastFood = new Date();
    }

    function updateBlobbies() {
        for (var i = gameState.blobbies.length - 1; i >= 0; i--) {
            var blobby = gameState.blobbies[i];

            var mousePos = mousePoses[blobby.id];
            if (mousePos != undefined) {
                updateBlobby(mousePos, blobby);
                if (handleBlobbyOverlap(blobby, i)) {
                    i = gameState.blobbies.length - 1;
                    continue;
                }
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

    function handleBlobbyOverlap(blobby, blobbyIndex) {
        for (var i = gameState.blobbies.length - 1; i >= 0; i--) {
            var otherBlobby = gameState.blobbies[i];
            if ((blobby.id != otherBlobby.id) && blobby.overlaps(otherBlobby)) {
                if (blobby.size > (otherBlobby.size + minimumSizeDifferenceForEating)) {
                    blobby.increaseSize(otherBlobby);
                    gameState.blobbies.splice(i, 1);
                } else if (otherBlobby.size > (blobby.size + minimumSizeDifferenceForEating)) {
                    otherBlobby.increaseSize(blobby);
                    gameState.blobbies.splice(blobbyIndex, 1);
                    return true;
                }
            }
        }
        return false;
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

    var magnitude = calculateVectorMagnitude(vector);

    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude
    };
}

function calculateVectorMagnitude(vector) {
    return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
}

util.inherits(GameEngine, EventEmitter);

module.exports = GameEngine;