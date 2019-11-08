//Files & Modules
var email  = require('../../resources/email.js');
var config = require('../../resources/config.js');
var functions = require('../../resources/functions.js');
var message = require('../../resources/messages.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var offers = mongoose.model('offers');
var feedbacks = mongoose.model('feedbacks');

//Controllers
var users_controller = require('./users.js');
var feedback_controller = require('./feedbacks.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

// #other
exports.createFeedback = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id', 'feed'];

    var id = request.body.user_id;
    var feed_body = request.body.feed;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        if (object_id.isValid(id)) {

            users.find({_id:id}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        var user_params = JSON.stringify(user[0]);
                        var user_details = JSON.parse(user_params);

                        var feed = {

                            feed_by: user_details['_id'],
                            feed: feed_body
                        };
                        var new_feed = new feedbacks(feed);

                        new_feed.save(function(error, feed) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    error: message.serverErrorOccurred
                                });
                            } else {

                                email.sendHtmlEmail(config.mail.feedbackemail, 'Feedback on '+ config.app.name +' by '+ user_details['name'] +'!', '<table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="500" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td> <table width="500" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="420" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="left" valign="top" style="font-size:17px; line-height:24px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;">' + feed.feed + '</td> </tr> <tr> <td align="left" height="15" valign="top" style="border-top:1px solid #e6e6e6;font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-size:17px; line-height:26px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;">Thank you for using '+config.app.name+'!</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table align="center" width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <table width="500" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-family: Helvetica, arial, sans-serif; font-size: 13px; line-height: 20px;color: #7f7f7f; padding-left: 45px; padding-right: 45px">© 2018 '+config.app.name+'</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table>');

                                response.json({

                                    error: false,
                                    message: message.feedSaved
                                });
                            }
                        });
                    } else {

                        // User not exists
                        response.json({

                            error: true,
                            message: message.invalidUser
                        });
                    }
                }
            });
        } else {

            // User not exists
            response.json({

                error: true,
                message: message.invalidUser
            });
        }
    }
};

exports.feedbackList = function(request, response) {

    feedback_controller.getAllFeedbacks(function (error, feedback_details) {

        if (error) {

            response.json({

                error: true,
                feedbacks: null,
                message: message.serverErrorOccurred
            });
        } else {

            response.json({

                error: false,
                feedbacks: feedback_details['feedbacks'].sort({created_at:-1}),
                message: message.feedListed
            });
        }
    });
};

// Get all feedbacks
// exports.getAllFeedbacks = function(callback) {
//
//     var result;
//     feedbacks.find({}, function(error, result_feeds) {
//
//         if (error) {
//
//             result = {
//
//                 error: true,
//                 error_description: error.message
//             };
//             return callback(result, null);
//         } else {
//
//             if (result_feeds.length > 0) {
//
//                 var array_feeds = new Array();
//                 var feedbackCount = 0;
//                 result_feeds.forEach((currentFeed, index, array) => {
//
//                     asyncFunction(currentFeed, (currentUser) => {
//
//                         var feedback_details = {};
//                         feedback_details['details'] = feedback_controller.formatFeedbacks(currentFeed);
//                         feedback_details['user'] = users_controller.formatUsers(currentUser, false);
//                         array_feeds.push(feedback_details);
//                         feedbackCount++;
//
//                         if (feedbackCount === array.length) {
//
//                             result = {
//
//                                 error: false,
//                                 feedbacks: array_feeds
//                             };
//                             return callback(null, result);
//                         }
//                     });
//                 });
//             } else {
//
//                 result = {
//
//                     error: false,
//                     feedbacks: new Array()
//                 };
//                 return callback(null, result);
//             }
//         }
//     }).sort({created_at:-1});
// };

exports.getAllFeedbacks = function(callback) {

    var result;
    feedbacks.find({}, function(error, result_feeds) {

        if (error) {

            result = {

                error: true,
                error_description: error.message
            };
            return callback(result, null);
        } else {

            if (result_feeds.length > 0) {

                var array_feeds = new Array();
                var feedbackCount = 0;
                result_feeds.forEach((currentFeed, index, array) => {

                    asyncFunction(currentFeed, (currentUser) => {

                    var feedback_details = {};
                    feedback_details['details'] = feedback_controller.formatFeedbacks(currentFeed);
                    feedback_details['user'] = users_controller.formatUsers(currentUser, false);
                    array_feeds.push(feedback_details);
                    feedbackCount++;

                    if (feedbackCount === array.length) {

                        result = {

                            error: false,
                            feedbacks: array_feeds
                        };
                        return callback(null, result);
                    }
                });
            });
            } else {

                result = {

                    error: false,
                    feedbacks: new Array()
                };
                return callback(null, result);
            }
        }
    }).sort({created_at:-1});
};

// Format Feedback
exports.formatFeedbacks = function (feed) {

    var feed_params = JSON.stringify(feed);
    var feed_details = JSON.parse(feed_params);

    var feed_id = feed_details['_id'];

    var feed = {

        feed_id: feed_id,
        feed_by: feed_details['feed_by'],
        feed: feed_details['feed'],
        created_at: feed_details['created_at'],
        updated_at: feed_details['updated_at'],
    };

    return feed;
}

// function asyncFunction (feed, callback) {
//
//     setTimeout(() => {
//
//         users_controller.getUserById(feed['feed_by'], function (error, user_details) {
//
//             callback(user_details);
//         });
//
//     }, 200);
// }
