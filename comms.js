var WebSocketServer = require("ws").Server;

module.exports = function comms(server) {

    var mousePosChangedFunc = null;
    var wss = new WebSocketServer({server: server});
    var socket = null;

    wss.on("connection", function (ws) {
        socket = ws;

        console.log("websocket connection open");

        ws.on("close", function () {
            socket = null;
            console.log("websocket connection close");
        });

        ws.on('message', function incoming(message) {
            var mousePos = JSON.parse(message);

            if (mousePosChangedFunc != null) {
                mousePosChangedFunc(mousePos);
            }
        });
    });

    this.onMousePosChanged = function(callback) {
        mousePosChangedFunc = callback;
    };

    this.sendState = function(gameState) {
        if (socket != null) {
            socket.send(JSON.stringify(gameState), function () {
            });
        }
    }
}