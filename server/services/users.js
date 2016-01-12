var User = require('mongoose').model('user');
var encryption = require('../services/encryption');
var mail = require('./mail');

module.exports = {
    create: function (user, callback) {
        User.create(user, callback);
    },
    getAll: function () {
        return User.find({});
    },
    getById: function (id) {
        return new Promise(function (resolve, reject) {
            User.findOne({_id: id})
                .then(function (user) {
                    if (!user) {
                        reject('User doesn\'t exist')
                    }

                    resolve(user);
                });
        });
    },
    setResetPasswordToken: function (email, link) {
        return new Promise(function (resolve, reject) {
            User.findOne({email: email})
                .then(function (user) {
                    if (!user) {
                        reject({success: false})
                    }

                    user.token = encryption.generateRandomText(20);
                    user.save();
                    link = link + user.token;
                    mail.changePassword(email, link)
                        .then(function () {
                            resolve({success: true})
                        })
                        .catch(function (err) {
                            reject(err)
                        });
                });
        });
    },
    getUserByToken: function (token) {
        return new Promise(function (resolve, reject) {
            User.findOne({token: token})
                .then(function (user) {
                    if (!user) {
                        reject('User does\'t exist!')
                    }

                    resolve(user);
                });
        });
    },
    changePassword: function (userData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getById(userData.id)
                .then(function (user) {
                    user.hashPass = encryption.generateHashedPassword(user.salt, userData.password);
                    user.token = undefined;
                    user.save();

                    resolve(user);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    },
    edit: function (id, userData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getById(id)
                .then(function (user) {
                    user.email = userData.email || userData.email;
                    user.username = userData.username || userData.username;
                    if(userData.role && user.roles.indexOf(userData.role) < 0 ){
                        user.roles.push(userData.role);
                    }

                    var roleIndex = user.roles.indexOf(userData.removeRole);
                    if(userData.removeRole && roleIndex  > -1 ){
                        user.roles.splice(roleIndex, 1);
                    }

                    user.save();
                    resolve(user);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    }
};