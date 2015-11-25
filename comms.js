var WebSocketServer = require("ws").Server;

module.exports = function Comms(server) {

    var wss = new WebSocketServer({server: server});

    wss.on("connection", function (ws) {
        console.log("websocket connection open");

        ws.on("close", function () {
            console.log("websocket connection close");
        });

        ws.on('message', function incoming(message) {
            ws.send(JSON.stringify(message), function () {
            })
        });
    });
}