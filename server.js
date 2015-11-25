var express = require("express");
var bodyParser = require("body-parser");

var WebSocketServer = require("ws").Server;
var http = require("http");

var app = express();
app.use(bodyParser.json());

app.use("/", require("./static"));

var server = http.createServer(app);
server.listen(8080, function() {
    console.log("server listening on", 8080);
});

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws) {
    console.log("websocket connection open");

    ws.on("close", function() {
        console.log("websocket connection close");
    });

    ws.on('message', function incoming(message) {
        ws.send(JSON.stringify(message), function() {  })
    });
});