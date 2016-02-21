var Settings = require("../model/settings");
var router = require("express").Router();

router.get("/", function (req, res, next) {
    Settings.find()
        .limit(1)
        .sort({$natural:-1})
        .exec(function(err, settingsList) {
            if (err) {
                return next(err);
            }
            res.json(settingsList);
        });
});

router.post("/", function (req, res, next) {
    var settings = new Settings({
        username: req.body.username,
        gameCode: req.body.gameCode
    });

    settings.save(function (err, post) {
        if (err) {
            return next(err);
        }
        res.status(201).json(post);
    });
});

module.exports = router;