//Files & Modules
var config = require('../../resources/config.js');
var message = require('../../resources/messages.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var offers = mongoose.model('offers');
var chats = mongoose.model('chats');
var deals = mongoose.model('deals');

//Controllers
var users_controller = require('./users.js');
var chats_controller = require('./chats.js');
var notifications_controller = require('./notifications.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

//Node Packages
//Firebase
//The Firebase Admin SDK allows you to integrate your own backend services with Firebase Cloud Messaging (FCM).
var firebase_admin = require("firebase-admin");
var json_path = "../../resources/firebase/"+ config.firebase.jsonfile;
var service_account = require(json_path);

//Firebase Initialization
firebase_admin.initializeApp({

    credential: firebase_admin.credential.cert(service_account),
    databaseURL: ""
});

var options = {

    priority: "high",
    timeToLive: 60 * 60 *24
};

exports.associated_options = options;

// #Chat Action
exports.sendMessage = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['to_user_id', 'for_user_id', 'body'];

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

        var to_user = request.body.to_user_id;
        var for_user = request.body.for_user_id;
        var body = request.body.body;

        //Receiver
        if (object_id.isValid(to_user)) {

            users.find({_id:to_user}, function(error, result_to) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (result_to.length) {

                        // Receiver exists
                        // Sender
                        if (object_id.isValid(for_user)) {

                            users.find({_id:for_user}, function(error, result_for) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        error: message.serverErrorOccurred
                                    });
                                } else {

                                    if (result_for.length) {

                                        var request_params = JSON.stringify(result_to[0]);
                                        var to_user_details = JSON.parse(request_params);

                                        var request_params = JSON.stringify(result_for[0]);
                                        var for_user_details = JSON.parse(request_params);

                                        var user_cloudkey = to_user_details['cloud_key'];

                                        var chat = {

                                            for_user: for_user,
                                            to_user: to_user,
                                            body: body,
                                        };
                                        var new_chat = new chats(chat);

                                        new_chat.save(function(error, chat) {

                                            if (error) {

                                                response.json({

                                                    error: true,
                                                    error_description: error.message,
                                                    error: message.serverErrorOccurred
                                                });
                                            } else {

                                                // For send notification
                                                var payload = {
                                                    notification: {

                                                        title: for_user_details['name'],
                                                        body: body
                                                    }, data: {

                                                        for_user_id: for_user,
                                                        to_user_id: to_user,
                                                        body: body
                                                    }
                                                };

                                                chats_controller.sendReceiverMessage(user_cloudkey, payload, chats_controller.associated_options, function (error, response) {

                                                    if (error) {

                                                        console.log("Error sending message:", error);
                                                    } else {

                                                        console.log("Successfully sent message:", response);
                                                    }
                                                });

                                                response.json({

                                                    error: false,
                                                    message: message.chatSaved
                                                });
                                            }
                                        });
                                    } else {

                                        // Sender not exists
                                        response.json({

                                            error: true,
                                            message: message.invalidSender
                                        });
                                    }
                                }
                            });
                        } else {

                            // Sender not exists
                            response.json({

                                error: true,
                                message: message.invalidSender
                            });
                        }
                    } else {

                        // Receiver not exists
                        response.json({

                            error: true,
                            message: message.invalidReceiver
                        });
                    }
                }
            });
        } else {

            // Receiver not exists
            response.json({

                error: true,
                message: message.invalidReceiver
            });
        }
    }
};

exports.chatList = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['to_user_id', 'for_user_id'];

    var sender_id = request.query.for_user_id;
    var receiver_id = request.query.to_user_id;
    var offer_id = request.query.offer_id;

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

        // Sender
        if (object_id.isValid(sender_id)) {

            users.find({_id:sender_id}, function(error, for_user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (for_user.length) {

                        // Sender exists
                        // Receiver
                        if (object_id.isValid(receiver_id)) {

                            users.find({_id:receiver_id}, function(error, to_user) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        message: message.serverErrorOccurred
                                    });
                                } else {

                                    if (to_user.length) {

                                        // Receiver exists
                                        // Offer
                                        if (offer_id) {

                                            if (object_id.isValid(offer_id)) {

                                                offers.find({_id:offer_id}, function(error, for_offer) {

                                                    if (error) {

                                                        response.json({

                                                            error: true,
                                                            error_description: error.message,
                                                            error: message.serverErrorOccurred
                                                        });
                                                    } else {

                                                        if (for_offer.length) {

                                                            // Offer exists
                                                            chats_controller.getChat(sender_id, receiver_id, function (result) {

                                                                if (result['chats']) {

                                                                    var array_chats = new Array();
                                                                    array_chats.push.apply(array_chats, result['chats']);

                                                                    deals.findOne({ for_user: sender_id, to_user: receiver_id, offer_id: offer_id }, function(error, deal) {

                                                                        if (!deal) {

                                                                            var offer_params = JSON.stringify(for_offer[0]);
                                                                            var offer_details = JSON.parse(offer_params);

                                                                            var offer_creator = offer_details['offer_by'];

                                                                            if (offer_creator != sender_id) {

                                                                                // Deal exists
                                                                                var last_chat = {

                                                                                    for_user: sender_id,
                                                                                    to_user: receiver_id,
                                                                                    body: message.confirmMeetingMessage,
                                                                                    take_action: 1
                                                                                };
                                                                                array_chats.push(last_chat);
                                                                            }

                                                                            response.json({

                                                                                error: false,
                                                                                chats: array_chats,
                                                                                message: message.chatListed
                                                                            });
                                                                        }
                                                                    });
                                                                } else {

                                                                    response.json(result);
                                                                }
                                                            });
                                                        } else {

                                                            // Offer not exists
                                                            response.json({

                                                                error: true,
                                                                message: message.invalidOffer
                                                            });
                                                        }
                                                    }
                                                });
                                            } else {

                                                // Offer not exists
                                                response.json({

                                                    error: true,
                                                    message: message.invalidOffer
                                                });
                                            }
                                        } else {

                                            chats_controller.getChat(sender_id, receiver_id, function (result) {

                                                response.json(result);
                                            });
                                        }
                                    } else {

                                        // Receiver not exists
                                        response.json({

                                            error: true,
                                            message: message.invalidReceiver
                                        });
                                    }
                                }
                            });
                        } else {

                            // Receiver not exists
                            response.json({

                                error: true,
                                message: message.invalidReceiver
                            });
                        }
                    } else {

                        // Sender not exists
                        response.json({

                            error: true,
                            message: message.invalidSender
                        });
                    }
                }
            });
        } else {

            // Sender not exists
            response.json({

                error: true,
                message: message.invalidSender
            });
        }
    }
};

exports.chatUserList = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id'];

    var sender_id = request.query.user_id;

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

        // Sender
        if (object_id.isValid(sender_id)) {

            users.find({_id:sender_id}, function(error, for_user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (for_user.length) {

                        // Sender exists
                        // To sender
                        chats.aggregate([{ $group: {  _id: { for_user: '$for_user', to_user: sender_id } } }], function(error, chat_users) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            } else {

                                var array_chat_users = new Array();
                                chat_users.forEach(function(element){

                                    var current_id = element['_id']['for_user'];
                                    if (!array_chat_users.includes(current_id)) {

                                        array_chat_users.push(current_id);
                                    }
                                });

                                // For sender
                                chats.aggregate([{ $group: {  _id: { for_user: sender_id, to_user:'$to_user'  } } }], function(error, chat_users) {

                                    if (error) {

                                        response.json({

                                            error: true,
                                            error_description: error.message,
                                            message: message.serverErrorOccurred
                                        });
                                    } else {

                                        chat_users.forEach(function(element){

                                            var current_id = element['_id']['to_user'];
                                            if (!array_chat_users.includes(current_id)) {

                                                array_chat_users.push(current_id);
                                            }
                                        });

                                        // Remove self from list
                                        var sender_id_index = array_chat_users.indexOf(sender_id);
                                        array_chat_users.splice(sender_id_index, 1);

                                        var chat_user_details = new Array();
                                        for (var i = 0; i <array_chat_users.length; i++) {

                                            users_controller.getUserById(array_chat_users[i], function (error, user_details) {

                                                if (user_details) {

                                                    chat_user_details.push(users_controller.formatUsers(user_details, false));
                                                }

                                                if (array_chat_users[array_chat_users.length-1] == chat_user_details[chat_user_details.length-1]['user_id']) {

                                                    response.json({

                                                        error: false,
                                                        chats: chat_user_details,
                                                        message: message.chatUsersListed
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }).sort({created_at:1});
                            }
                        }).sort({created_at:1});
                    } else {

                        // Sender not exists
                        response.json({

                            error: true,
                            message: message.invalidSender
                        });
                    }
                }
            });
        } else {

            // Sender not exists
            response.json({

                error: true,
                message: message.invalidSender
            });
        }
    }
};

exports.confirmMeetingAction = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['to_user_id', 'for_user_id', 'offer_id', 'action'];

    var sender_id = request.body.for_user_id;
    var receiver_id = request.body.to_user_id;
    var offer_id = request.body.offer_id;
    var action = request.body.action;

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

            "error": true,
            "message": 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        // Sender
        if (object_id.isValid(sender_id)) {

            users.find({_id:sender_id}, function(error, for_user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (for_user.length) {

                        // Sender exists
                        // Receiver
                        if (object_id.isValid(receiver_id)) {

                            users.find({_id:receiver_id}, function(error, to_user) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        message: message.serverErrorOccurred
                                    });
                                } else {

                                    if (to_user.length) {

                                        // Receiver exists
                                        // Offer
                                        if (object_id.isValid(offer_id)) {

                                            offers.find({_id:offer_id}, function(error, for_offer) {

                                                if (error) {

                                                    response.json({

                                                        error: true,
                                                        error_description: error.message,
                                                        error: message.serverErrorOccurred
                                                    });
                                                } else {

                                                    if (for_offer.length) {

                                                        // Offer exists
                                                        var offer_params = JSON.stringify(for_offer[0]);
                                                        var offer_details = JSON.parse(offer_params);

                                                        var offer_creator = offer_details['offer_by'];

                                                        if (offer_creator != sender_id) {

                                                            if (action ===  '1') {

                                                                // Offer Accept
                                                                chats_controller.createDeal(sender_id, receiver_id, offer_id, 'a', function (result) {

                                                                    response.json(result);
                                                                });
                                                            } else if (action ===  '0') {

                                                                // Offer Reject
                                                                chats_controller.createDeal(sender_id, receiver_id, offer_id, 'r', function (result) {

                                                                    response.json(result);
                                                                });
                                                            } else {

                                                                // Invalid Action
                                                                response.json({

                                                                    error: true,
                                                                    message: message.invalidAction
                                                                });
                                                            }
                                                        } else {

                                                            // Can't take action your own offer
                                                            response.json({

                                                                error: true,
                                                                message: message.offerActionNotApplicable
                                                            });
                                                        }
                                                    } else {

                                                        // Offer not exists
                                                        response.json({

                                                            error: true,
                                                            message: message.invalidOffer
                                                        });
                                                    }
                                                }
                                            });
                                        } else {

                                            // Offer not exists
                                            response.json({

                                                error: true,
                                                message: message.invalidOffer
                                            });
                                        }
                                    } else {

                                        // Receiver not exists
                                        response.json({

                                            error: true,
                                            message: message.invalidReceiver
                                        });
                                    }
                                }
                            });
                        } else {

                            // Receiver not exists
                            response.json({

                                error: true,
                                message: message.invalidReceiver
                            });
                        }
                    } else {

                        // Sender not exists
                        response.json({

                            error: true,
                            message: message.invalidSender
                        });
                    }
                }
            });
        } else {

            // Sender not exists
            response.json({

                error: true,
                message: message.invalidSender
            });
        }
    }
};

exports.getToken = function(user_id, callback) {

    firebase_admin.auth().createCustomToken(user_id) .then(function(token) {

        return callback(null, token);
    }) .catch(function(error) {

        return callback(error, null);
    });
};

exports.sendReceiverMessage = function(cloudkey, payload, options, callback) {

    if (cloudkey) {

        firebase_admin.messaging().sendToDevice(cloudkey, payload, options).then(function(response) {

            return callback(null, response);
        }) .catch(function(error) {

            return callback(error, null);
        });
    }
};

exports.createDeal = function (sender, receiver, offer, action, callback) {

    var result;
    deals.findOne({ for_user: sender, to_user: receiver, offer_id: offer }, function(error, deal) {

        if (!error && deal) {

            // Deal exists
            result ={

                error: true,
                message : message.offerActionAlready
            };
            return callback(result);
        } else {

            // Deal not exists
            var status = 'p';
            if (action === 'r') {

                status = 'd';
            }
            var deal = {

                for_user: receiver,
                to_user: sender,
                offer_id: offer,
                offer_status: action,
                deal_status: status
            };

            var new_deal = new deals(deal);
            new_deal.save(function(error, result_deal) {

                if (error) {

                    result = {

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    };

                    return callback(result);
                } else {

                    var action_message;
                    if (action === 'a') {

                        action_message = message.offerAccepted;
                        users_controller.getUserById(sender, function (error, result_user) {

                            if (result_user) {

                                var user_params = JSON.stringify(result_user);
                                var user_details = JSON.parse(user_params);
                                var notification = 'You have accept offer from '+ user_details.name;

                                notifications_controller.createNotifications(receiver, sender, notification, offer, function(error, result_notification) {

                                    if (result_notification) {

                                        console.log(message.notificationGenerated);
                                    }
                                });
                            }
                        });

                        users_controller.getUserById(receiver, function (error, result_user) {

                            if (result_user) {

                                var user_params = JSON.stringify(result_user);
                                var user_details = JSON.parse(user_params);
                                var notification = 'Your offer is accepted by '+ user_details.name;

                                notifications_controller.createNotifications(sender, receiver, notification, offer, function(error, result_notification) {

                                    if (result_notification) {

                                        console.log(message.notificationGenerated);
                                    }
                                });
                            }
                        });
                    } else if (action === 'r') {

                        action_message = message.offerRejected;
                        users_controller.getUserById(sender, function (error, result_user) {

                            if (result_user) {

                                var user_params = JSON.stringify(result_user);
                                var user_details = JSON.parse(user_params);
                                var notification = 'You have reject offer from '+ user_details.name;

                                notifications_controller.createNotifications(receiver, sender, notification, offer, function(error, result_notification) {

                                    if (result_notification) {

                                        console.log(message.notificationGenerated);
                                    }
                                });
                            }
                        });

                        users_controller.getUserById(receiver, function (error, result_user) {

                            if (result_user) {

                                var user_params = JSON.stringify(result_user);
                                var user_details = JSON.parse(user_params);
                                var notification = 'Your offer is rejected by '+ user_details.name;

                                notifications_controller.createNotifications(sender, receiver, notification, offer, function(error, result_notification) {

                                    if (result_notification) {

                                        console.log(message.notificationGenerated);
                                    }
                                });
                            }
                        });
                    }

                    result = {

                        error: false,
                        message: action_message
                    };

                    return callback(result);
                }
            });
        }
    });
};

exports.getChat = function (sender, receiver, callback) {

    var result;
    chats.find({$or: [ {for_user: sender, to_user: receiver}, {for_user: receiver, to_user:sender} ] }, function(error, chat_messgas) {

        if (error) {

            result = {

                error: true,
                error_description: error.message,
                message: message.serverErrorOccurred
            };
            callback(result);
        } else {

            var array_chats = new Array();
            for (var i = 0; i < chat_messgas.length; i++) {

                array_chats.push(formatChats(chat_messgas[i]));
            }

            result = {

                error: false,
                chats: array_chats,
                message: message.chatListed
            };
            callback(result);
        }
    }).sort({created_at:1});
};

// Format Chats
function formatChats (chat) {

    var chat_params = JSON.stringify(chat);
    var chat_details = JSON.parse(chat_params);

    var chat_id = chat_details['_id'];

    var chat = {

        chat_id: chat_id,
        for_user: chat_details['for_user'],
        to_user: chat_details['to_user'],
        body: chat_details['body'],
        created_at: chat_details['created_at'],
        updated_at: chat_details['updated_at'],
    };

    return chat;
}