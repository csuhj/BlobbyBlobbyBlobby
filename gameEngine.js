var Blobby = function(x, y, radius, colour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
};

var worldWidth = 1000;
var worldHeight = 1000;

module.exports = function gameEngine(comms) {

    var mousePos = {
        x: 0,
        y: 0
    };

    var gameState = {
        blobbies: [],
        myBlobby: new Blobby(500, 500, 15, 'green')
    };

    gameState.blobbies.push(new Blobby(20, 20, 5, 'yellow'));
    gameState.blobbies.push(new Blobby(400, 400, 5, 'red'));
    gameState.blobbies.push(new Blobby(380, 600, 2, 'blue'));

    comms.onMousePosChanged(function(newMousePos){
        mousePos = newMousePos;
    });

    function gameLoop() {
        updateMyBlobby(mousePos, gameState.myBlobby);
        comms.sendState(gameState);

        setTimeout(function() {
            gameLoop()
        }, 1000/60);
    }

    function updateMyBlobby(mousePos, blobby) {
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

    gameLoop();
};