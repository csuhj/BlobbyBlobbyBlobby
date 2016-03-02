var User = require("../model/user");
var router = require("express").Router();
var bcrypt = require("bcrypt");

router.post("/", function (req, res, next) {
    var user = new User({
        username: req.body.username
    });

    bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }

        User.find({ username: user.username })
            .count(function(err, count) {
                if (err) {
                    return next(err);
                } else {
                    if (count != 0) {
                        res.sendStatus(409) // 409 conflict
                    } else {
                        user.password = hash;
                        user.save(function (err, post) {
                            if (err) {
                                return next(err);
                            }

                            res.status(201).json(post);
                        });
                    }
                }
            });
    });
});

module.exports = router;