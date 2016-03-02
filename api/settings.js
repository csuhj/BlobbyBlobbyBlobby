var Settings = require("../model/settings");
var router = require("express").Router();
var jwt = require("jwt-simple");

router.get("/", function (req, res, next) {
    if (!req.headers['x-auth']) {
        return res.sendStatus(401);
    }

    var auth = jwt.decode(req.headers['x-auth'], "secretkey");
    if (auth.username != req.query.username) {
        return res.sendStatus(401);
    }

    Settings.find({ username: req.query.username } )
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
    if (!req.headers['x-auth']) {
        return res.sendStatus(401);
    }

    var auth = jwt.decode(req.headers['x-auth'], "secretkey");
    if (auth.username != req.body.username) {
        return res.sendStatus(401);
    }

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