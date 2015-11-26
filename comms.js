var WebSocketServer = require("ws").Server;

module.exports = function Comms(server, engine) {

    var nextConnectionId = 0;
    var wss = new WebSocketServer({server: server});

    wss.on("connection", function (ws) {
        ws.id = "player "+(nextConnectionId++);
        console.log("websocket connection "+ws.id+" open");

        engine.addBlobby(ws.id);

        engine.on("gameStateUpdated", function () {
            myState = engine.createMyState(ws.id);

            ws.send(JSON.stringify(myState), function () {
            });
        });

        ws.on("close", function () {
            engine.removeBlobby(ws.id);
            console.log("websocket connection "+ws.id+" closed");
        });

        ws.on('message', function incoming(message) {
            var mousePos = JSON.parse(message);

            engine.updateMousePos(mousePos, ws.id);
        });
    });
};