var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/blobby", function() {
    console.log("mongodb connected");
});

module.exports = mongoose;