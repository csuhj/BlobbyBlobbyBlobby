var WebSocketServer = require("ws").Server;

module.exports = function Comms(server, engine) {

    var nextConnectionId = 0;
    var wss = new WebSocketServer({server: server});

    wss.on("connection", function (ws) {
        ws.id = "player "+(nextConnectionId++);
        console.log("websocket connection "+ws.id+" open");

        engine.addPlayer(ws.id);

        engine.on("gameStateUpdated", sendGameState);

        ws.on("close", function () {
            engine.removePlayer(ws.id);
            engine.removeListener('gameStateUpdated', sendGameState);
            console.log("websocket connection "+ws.id+" closed");
        });

        ws.on('message', function incoming(message) {
            var mousePos = JSON.parse(message);

            engine.updateMousePos(mousePos, ws.id);
        });

        function sendGameState() {
            deltaString = engine.createMyStateDeltaString(ws.id);

            ws.send(deltaString, function () {
            });
        }
    });
};