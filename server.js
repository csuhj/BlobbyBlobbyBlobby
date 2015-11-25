var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());

app.use("/", require("./static"));

app.listen(8080, function() {
    console.log("server listening on", 8080);
});