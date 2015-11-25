var WebSocketServer = require("ws").Server;

module.exports = function Comms(server, engine) {

    var mousePosChangedFunc = null;
    var wss = new WebSocketServer({server: server});

    wss.on("connection", function (ws) {
        console.log("websocket connection open");
        engine.ensureStarted();

        engine.on("gameStateUpdated", function (state) {
            ws.send(JSON.stringify(state), function () {
            });
        });

        ws.on("close", function () {
            console.log("websocket connection close");
        });

        ws.on('message', function incoming(message) {
            var mousePos = JSON.parse(message);

            engine.updateMousePos(mousePos);
        });
    });
}