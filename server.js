var express = require("express");
var bodyParser = require("body-parser");
var comms = require("./comms");
var gameEngine = require("./gameEngine");

var http = require("http");

var app = express();
app.use(bodyParser.json());

app.use("/", require("./static"));

var portNumber = (process.env.PORT || 8080);

var server = http.createServer(app);
server.listen(portNumber, function() {
    console.log("server listening on", portNumber);
});

var engine = new gameEngine();
new comms(server, engine);