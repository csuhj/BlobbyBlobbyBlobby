var express = require("express");
var bodyParser = require("body-parser");
var comms = require("./comms");

var http = require("http");

var app = express();
app.use(bodyParser.json());

app.use("/", require("./static"));

var server = http.createServer(app);
server.listen(8080, function() {
    console.log("server listening on", 8080);
});

new comms(server);