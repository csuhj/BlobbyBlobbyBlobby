var setName = false;

gameFrame = function () {

    context.clearRect(0, 0, canvas.width, canvas.height);

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
        setName = true;
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

        if (blobby.name != undefined) {
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.font='20px Georgia';
            context.fillText(blobby.name,offsetX, offsetY);
        }
    }
}