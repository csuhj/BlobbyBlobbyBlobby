var setName = false;

gameFrame = function () {

    clearCanvas();

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    var mousePosRelativeToCentre = {
        x: latestMousePos.x - centerX,
        y: latestMousePos.y - centerY
    };

    sendMousePos(mousePosRelativeToCentre);
    sendSpacebarPressed();

    if ((gameState != null) && (gameState.me != null)) {
        drawBackground(gameState.me);
        for (var i = 0; i < gameState.food.length; i++) {
            drawBlobby(gameState.me, gameState.food[i]);
        }
        for (var i = 0; i < gameState.players.length; i++) {
            drawBlobby(gameState.me, gameState.players[i]);
        }
        drawBlobby(gameState.me, gameState.me);
        statusLabel.innerHTML = gameState.me.size.toFixed(1);
    }

    if ((gameState != null) && (gameState.me != null) && (setName === false)) {
        updateName('adam');
        updateColour('green');
        updateSplitFraction(0.5);

        setName = true;
    }
}