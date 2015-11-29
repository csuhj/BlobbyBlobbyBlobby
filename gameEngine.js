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
        food: [],
        players: []
    };

    var running = false;
    var timeOfLastFood = new Date();

    this.updateMousePos = function(newMousePos, id) {
        mousePoses[id] = newMousePos;
    };

    this.addPlayer = function(id) {
        this.ensureStarted();
        gameState.players.push(new Blobby(id, 500, 500, 15, 'green'));
    };

    this.removePlayer = function(id) {
        var numberOfPlayers = 0;

        for (var i = gameState.players.length - 1; i >= 0; i--) {
            if (gameState.players[i].id === id) {
                gameState.players.splice(i, 1);
            } else {
                if (gameState.players[i].isPlayer()) {
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
            food: [],
            players: [],
            me: null
        };

        for (var i = 0; i < gameState.food.length; i++) {
            gameStateForId.food.push(gameState.food[i]);
        }

        for (var i = 0; i < gameState.players.length; i++) {
            if (gameState.players[i].id === id) {
                gameStateForId.me = gameState.players[i];
            } else {
                gameStateForId.players.push(gameState.players[i]);
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
            food: [],
            players: []
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
        gameState.food.push(new Blobby("food", foodX, foodY, 5, 'yellow'));
        timeOfLastFood = new Date();
    }

    function updateBlobbies() {
        for (var i = gameState.players.length - 1; i >= 0; i--) {
            var player = gameState.players[i];

            var mousePos = mousePoses[player.id];
            if (mousePos != undefined) {
                updateBlobby(mousePos, player);
                if (handleBlobbyOverlap(player, i)) {
                    i = gameState.players.length - 1;
                    continue;
                }
            }
        }
    }

    function updateBlobby(mousePos, player) {
        var unitVector = calculateUnitVectorFromOrigin(mousePos);

        var speed = player.getSpeed();
        var vector = {
            x: unitVector.x * speed,
            y: unitVector.y * speed
        };

        if ((mousePos.x > 5) && (player.x < worldWidth)) {
            player.x += vector.x;
        } else if ((mousePos.x < -5) && (player.x > 0)) {
            player.x += vector.x;
        }

        if ((mousePos.y > 5) && (player.y < worldHeight)) {
            player.y += vector.y;
        } else if ((mousePos.y < -5) && (player.y > 0)) {
            player.y += vector.y;
        }
    }

    function handleBlobbyOverlap(player, playerIndex) {
        for (var i = gameState.food.length - 1; i >= 0; i--) {
            var food = gameState.food[i];
            if (player.overlaps(food)) {
                if (player.size > (food.size + minimumSizeDifferenceForEating)) {
                    player.increaseSize(food);
                    gameState.food.splice(i, 1);
                }
            }
        }

        for (var i = gameState.players.length - 1; i >= 0; i--) {
            var otherPlayer = gameState.players[i];
            if ((player.id != otherPlayer.id) && player.overlaps(otherPlayer)) {
                if (player.size > (otherPlayer.size + minimumSizeDifferenceForEating)) {
                    player.increaseSize(otherPlayer);
                    gameState.players.splice(i, 1);
                } else if (otherPlayer.size > (player.size + minimumSizeDifferenceForEating)) {
                    otherPlayer.increaseSize(player);
                    gameState.players.splice(playerIndex, 1);
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