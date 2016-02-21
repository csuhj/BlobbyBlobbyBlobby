var db = require("../database");

var Settings = db.model("Settings", {
    username: {type: String, required: true },
    gameCode: {type: String, required: true },
});

module.exports = Settings;