var passport = require('passport');
var LocalPassport = require('passport-local');
var User = require('mongoose').model('user');

module.exports = function() {
    passport.use(new LocalPassport(function(username, password, done) {
        var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
        User.findOne(criteria).exec(function(err, user) {
            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }

            if (user && user.authenticate(password)) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

    passport.serializeUser(function(user, done) {
        if (user) {
            return done(null, user._id);
        }
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({_id: id}).exec(function(err, user) {
            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }

            if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    });
};