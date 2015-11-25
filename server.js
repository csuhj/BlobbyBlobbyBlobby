var express = require("express");
var bodyParser = require("body-parser");
var comms = require("./comms");
var gameEngine = require("./gameEngine");

var http = require("http");

var app = express();
app.use(bodyParser.json());

app.use("/", require("./static"));

var server = http.createServer(app);
server.listen(8080, function() {
    console.log("server listening on", 8080);
});

var engine = new gameEngine();
new comms(server, engine);