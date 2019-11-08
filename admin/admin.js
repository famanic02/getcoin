//Express
var express = require('express');
var router = express.Router();

//Files & Modules
var config = require('../resources/config.js');
var messages = require('../resources/messages.js');
var constants = require('../resources/constants.js');

//Models
var mongoose = require('mongoose');

//Controllers
var users_controller = require('../api/controllers/users.js');
var feedbacks_controller = require('../api/controllers/feedbacks.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

//Node Packages
//Crypto
var crypto = require('crypto');

//Home
router.get('/', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to home page
        response.render('index', { message : ""});
    } else {

        // Session not exists, redirect to login page
        response.redirect('/admin/login');
    }
});

//Users
router.get('/users', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to users page
        users_controller.getAllUsers(function (error, user_details) {

            if (user_details) {

                response.render('user', {

                    users : user_details,
                    message : messages.userListed
                });
            } else {

                response.render('user', {

                    users : user_details,
                    message : error
                });
            }
        });
    } else {

        // Session not exists, redirect to login page
        response.render('login', { message : ""});
    }
});

//Feedbacks
router.get('/feedbacks', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to feedbacks page
        feedbacks_controller.getAllFeedbacks(function (error, feedbacks) {

            if (feedbacks) {

                response.render('feed', {

                    feeds : feedbacks,
                    message : messages.feedListed
                });
            } else {

                response.render('feed', {

                    feeds : feedbacks,
                    message : error
                });
            }
        });
    } else {

        // Session not exists, redirect to login page
        response.render('login', { message : ""});
    }
});

//Tickets
router.get('/tickets', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to home page
        response.render('ticket', { message : ""});
    } else {

        // Session not exists, redirect to login page
        response.render('login', { message : ""});
    }
});

//Support
router.get('/supports', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to home page
        response.render('support', { message : ""});
    } else {

        // Session not exists, redirect to login page
        response.render('login', { message : ""});
    }
});

//Stats
router.get('/stats', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to home page
        response.render('stats', { message : ""});
    } else {

        // Session not exists, redirect to login page
        response.render('login', { message : ""});
    }
});

//#Gernal
//Login
router.get('/login', function(request, response) {

    if (request.session.user) {

        // Session exists, redirect to home page
        response.redirect('/admin/');
    } else {

        // Session not exists, redirect to login page
        response.render('login', { message : ""});
    }
});

router.post('/login', function(request, response, next) {

    var username = request.body.username;
    var username_hashed = crypto.createHash('md5').update(username).digest('hex');
    var password = request.body.password;
    var password_hashed = crypto.createHash('md5').update(password).digest('hex');

    if (username_hashed == constants.ADMIN_USERNAME && password_hashed == constants.ADMIN_PASSWORD) {

        var admin = {

            'username' : constants.ADMIN_USERNAME,
            'user_id' : constants.ADMIN_USERID,
        };

        request.session.user = admin;
        response.redirect('/admin/');
    } else {

        response.render('login', {

            message : "Login failed. Incorrect credentials."
        });
    }
});

//Logout
router.get('/logout', function(request, response, next) {

    request.session.destroy();
    response.redirect('/admin/login');
});

module.exports = router;