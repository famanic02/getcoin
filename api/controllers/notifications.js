//Files & Modules
var email  = require('../../resources/email.js');
var config = require('../../resources/config.js');
var functions = require('../../resources/functions.js');
var message = require('../../resources/messages.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var offers = mongoose.model('offers');
var notifications = mongoose.model('notifications');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

// #notifications
exports.notificationList = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id'];

    var id = request.query.user_id;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.query);
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
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        notifications.find({notification_by:id}, function(error, notifications) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            } else {

                                var array_notifications = new Array();
                                for (var i = 0; i < notifications.length; i++) {

                                    array_notifications.push(formatNotifications(notifications[i]));
                                }

                                response.json({

                                    error: false,
                                    notifications: array_notifications,
                                    message: message.notificationListed
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

// Create notification
exports.createNotifications = function(sender, receiver, notification, offer, callback) {

    //Generate sender notifcation
    var generated_notification = {};
    generated_notification['notification_by'] = sender;
    generated_notification['notification_to'] = receiver;
    generated_notification['offer'] = offer;
    generated_notification['notification'] = notification;

    var new_notification = new notifications(generated_notification);

    new_notification.save(function(error, created_notification) {

        var result;
        if (error) {

            result = {

                error: true,
                error: message.serverErrorOccurred
            };
            callback (result, null);
        } else {

            result = {

                error: false,
                message: message.notificationGenerated
            };
            callback (null, result);
        }
    });
};

// Format Notifications
function formatNotifications (notification) {

    var notification_params = JSON.stringify(notification);
    var notification_details = JSON.parse(notification_params);

    var notification_id = notification_details['_id'];

    var notification = {

        notification_id: notification_id,
        notification_by: notification_details['notification_by'],
        notification_to: notification_details['notification_to'],
        notification: notification_details['notification'],
        created_at: notification_details['created_at'],
        updated_at: notification_details['updated_at'],
    };

    return notification;
}