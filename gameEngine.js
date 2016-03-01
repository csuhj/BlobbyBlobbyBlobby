var util = require('util');
var EventEmitter = require('events').EventEmitter;

var worldWidth = 1000;
var worldHeight = 1000;
var minimumSizeDifferenceForEating = 3;
var maximumDistanceForMerging = 10;
var minimumSplitSize = 10;
var speedMultiplier = 2;
var nextFoodId = 0;

function Blobby(playerId, instanceId, x, y, size, colour, name, isGhost) {
    this.playerId = playerId;
    this.instanceId = instanceId;
    this.x = x;
    this.y = y;
    this.size = size;
    this.colour = colour;
    this.name = name;
    this.isGhost = isGhost;

    this.getSpeed = function() {
        return Math.max((4000 - this.getArea()) / 800, 1);
    };

    this.getArea = function() {
        return Math.PI * (this.size * this.size);
    };

    this.distanceBetween = function(blobby) {
        var vector = {
            x: blobby.x - this.x,
            y: blobby.y - this.y
        };

        return Math.abs(calculateVectorMagnitude(vector));
    };

    this.overlaps = function(blobby) {
        if (this.isGhost == true) {
            return false;
        }

        var distanceBetweenBlobbies = this.distanceBetween(blobby);
        return distanceBetweenBlobbies < this.size + blobby.size;
    };

    this.increaseSize = function(blobby) {
        var area = this.getArea();
        var blobbyArea = blobby.getArea();

        this.size = Math.sqrt((blobbyArea + area) / Math.PI);
    };

    this.decreaseSize = function(blobby) {
        var area = this.getArea();
        var blobbyArea = blobby.getArea();

        this.size = Math.sqrt((area - blobbyArea) / Math.PI);
    };

    this.canSplit = function() {
        return this.size > minimumSplitSize;
    }

    this.splitAndCreateNewBlobby = function(mousePos) {
        var newBlobbySize = this.size * 0.5;

        var unitVector = calculateUnitVectorFromOrigin(mousePos);
        var offsetVector = multiplyVectorByScalar(unitVector, this.size * 3);

        var newBlobby = new Blobby(playerId, 'instance '+new Date().getTime(), this.x + offsetVector.x, this.y + offsetVector.y, newBlobbySize, this.colour, this.name, this.isGhost)

        this.decreaseSize(newBlobby);
        return newBlobby;
    }
}

function FoodDelta() {
    this.newFood = [];
    this.eatenFood = [];
}

function GameEngine() {

    EventEmitter.call(this);

    var mousePoses = [];
    var foodDeltas = [];

    var gameState = {
        food: [],
        players: []
    };

    var running = false;
    var timeOfLastFood = new Date();

    this.updateClientState = function(newClientState, playerId) {
        if (newClientState.mousePos != undefined) {
            mousePoses[playerId] = newClientState.mousePos;
        }
        if (newClientState.name != undefined) {
            for (var i = gameState.players.length - 1; i >= 0; i--) {
                if (gameState.players[i].playerId === playerId) {
                    gameState.players[i].name = newClientState.name;
                }
            }
        }
        if (newClientState.isGhost != undefined) {
            for (var i = gameState.players.length - 1; i >= 0; i--) {
                if (gameState.players[i].playerId === playerId) {
                    gameState.players[i].isGhost = newClientState.isGhost;
                }
            }
        }
        if (newClientState.colour != undefined) {
            for (var i = gameState.players.length - 1; i >= 0; i--) {
                if (gameState.players[i].playerId === playerId) {
                    gameState.players[i].colour = newClientState.colour;
                }
            }
        }
        if (newClientState.requestedAction === 'split') {
            var mousePos = mousePoses[playerId];

            //Have to search forwards in this case, as want to split the first blobby for player
            for (var i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].playerId === playerId) {
                    if (gameState.players[i].canSplit() && mousePos != undefined) {
                        var newBlobby = gameState.players[i].splitAndCreateNewBlobby(mousePos);
                        gameState.players.push(newBlobby);
                    }
                    break;
                }
            }
        }
    };

    this.addPlayer = function(playerId) {
        this.ensureStarted();
        gameState.players.push(new Blobby(playerId, 'initial', 500, 500, 15, 'green', 'player', true));

        foodDeltas[playerId] = new FoodDelta();
        for (var i = 0; i < gameState.food.length; i++) {
            foodDeltas[playerId].newFood.push(gameState.food[i]);
        }
    };

    this.removePlayer = function(playerId) {
        for (var i = gameState.players.length - 1; i >= 0; i--) {
            if (gameState.players[i].playerId === playerId) {
                gameState.players.splice(i, 1);
            }
        }

        delete foodDeltas[playerId];

        if (gameState.players.length == 0) {
            stop();
        }
    };

    this.createMyStateDeltaString = function(playerId) {
        var gameStateDeltaForId = {
            foodDelta: [],
            players: [],
            me: null
        };

        gameStateDeltaForId.foodDelta = foodDeltas[playerId];

        for (var i = 0; i < gameState.players.length; i++) {
            if ((gameState.players[i].playerId === playerId) && (gameStateDeltaForId.me === null)) {
                gameStateDeltaForId.me = gameState.players[i];
            } else {
                gameStateDeltaForId.players.push(gameState.players[i]);
            }
        }
        var string =  JSON.stringify(gameStateDeltaForId);

        foodDeltas[playerId].newFood = [];
        foodDeltas[playerId].eatenFood = [];

        return string;
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
        }, 1000/(60 / speedMultiplier));
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
        var food = new Blobby("food " + (nextFoodId++), 'initial', foodX, foodY, 5, 'yellow', undefined, undefined);
        gameState.food.push(food);
        addNewFoodToDeltas(food);
        timeOfLastFood = new Date();
    }

    function addNewFoodToDeltas(food) {
        for (var key in foodDeltas) {
            if (foodDeltas.hasOwnProperty(key)) {
                foodDeltas[key].newFood.push(food)
            }
        }
    }

    function addEatenFoodToDeltas(food) {
        for (var key in foodDeltas) {
            if (foodDeltas.hasOwnProperty(key)) {
                foodDeltas[key].eatenFood.push(food.playerId)
            }
        }
    }

    function updateBlobbies() {
        for (var i = gameState.players.length - 1; i >= 0; i--) {
            var player = gameState.players[i];

            var mousePos = mousePoses[player.playerId];
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

        var speed = player.getSpeed() * speedMultiplier;
        var vector = {
            x: unitVector.x * speed,
            y: unitVector.y * speed
        };

        if ((mousePos.x > 5) && (player.x < worldWidth)) {
            player.x += vector.x;
        } else if ((mousePos.x < -5) && (player.x > 0)) {
            player.x += vector.x;
        } else {
            vector.x = 0;
        }

        if ((mousePos.y > 5) && (player.y < worldHeight)) {
            player.y += vector.y;
        } else if ((mousePos.y < -5) && (player.y > 0)) {
            player.y += vector.y;
        } else {
            vector.y = 0;
        }

        player.vector = vector;
    }

    function handleBlobbyOverlap(player, playerIndex) {
        for (var i = gameState.food.length - 1; i >= 0; i--) {
            var food = gameState.food[i];
            if (player.overlaps(food)) {
                if (player.size > (food.size + minimumSizeDifferenceForEating)) {
                    player.increaseSize(food);
                    gameState.food.splice(i, 1);
                    addEatenFoodToDeltas(food);
                }
            }
        }

        for (var i = gameState.players.length - 1; i >= 0; i--) {
            var otherPlayer = gameState.players[i];
            if (player.overlaps(otherPlayer)) {
                if (player.playerId != otherPlayer.playerId) {
                    if (player.size > (otherPlayer.size + minimumSizeDifferenceForEating)) {
                        player.increaseSize(otherPlayer);
                        gameState.players.splice(i, 1);
                    } else if (otherPlayer.size > (player.size + minimumSizeDifferenceForEating)) {
                        otherPlayer.increaseSize(player);
                        gameState.players.splice(playerIndex, 1);
                        return true;
                    }
                } else {
                    if ((player.instanceId != otherPlayer.instanceId) && (playerIndex < i) && (player.distanceBetween(otherPlayer) < Math.max(player.size, otherPlayer.size) * 0.5)) {
                        player.increaseSize(otherPlayer);
                        gameState.players.splice(i, 1);
                    }
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

function multiplyVectorByScalar(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
}

util.inherits(GameEngine, EventEmitter);

module.exports = GameEngine;