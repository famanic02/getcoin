//Files & Modules
var email  = require('../../resources/email.js');
var config = require('../../resources/config.js');
var functions = require('../../resources/functions.js');
var message = require('../../resources/messages.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var offers = mongoose.model('offers');
var deals = mongoose.model('deals');

//Controllers
var users_controller = require('./users.js');
var offers_controller = require('./offers.js');
var deals_controller = require('./deals.js');
var notifications_controller = require('./notifications.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

// #deals
exports.dealList = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id'];

    var user_id = request.query.user_id;

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

        if (object_id.isValid(user_id)) {

            users.find({_id:user_id}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        deals.find({$or: [ {for_user: user_id}, {to_user:user_id} ]}, function(error, result_deals) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            } else {

                                var array_deals = new Array();
                                for (var i = 0; i < result_deals.length; i++) {

                                    array_deals.push(deals_controller.formatDeals(result_deals[i]));
                                }

                                response.json({

                                    error: false,
                                    deals: array_deals,
                                    message: message.dealListed
                                });
                            }
                        }).sort({created_by:-1});
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

exports.dealAction = function (request, response) {

    // Verify Required Parameters
    var required_fields = ['deal_id', 'action'];

    var deal_id = request.body.deal_id;

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

        if (object_id.isValid(deal_id)) {

            deals.find({_id:deal_id}, function(error, deal) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (deal.length) {

                        // Deal exists
                        var deal_params = JSON.stringify(deal[0]);
                        var deal_details = JSON.parse(deal_params);

                        var sender = deal_details['to_user'];
                        var receiver = deal_details['for_user'];
                        var offer = deal_details['offer_id'];
                        var status = deal_details['deal_status'][0];

                        offers_controller.getOfferById(offer, function (error, result_offer) {

                            if (result_offer) {

                                var offer_params = JSON.stringify(result_offer);
                                var offer_details = JSON.parse(offer_params);

                                var offer_creator = offer_details['offer_by'];

                                if (offer_creator != sender) {

                                    if (status === 'p') {

                                        var action = request.body.action;
                                        var deal_action;

                                        if (action === '1') {

                                            users_controller.getUserById(sender, function (error, result_user) {

                                                if (result_user) {

                                                    var user_params = JSON.stringify(result_user);
                                                    var user_details = JSON.parse(user_params);
                                                    var notification = 'You have accept deal from '+ user_details.name;

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
                                                    var notification = 'Your deal is accepted by '+ user_details.name;

                                                    notifications_controller.createNotifications(sender, receiver, notification, offer, function(error, result_notification) {

                                                        if (result_notification) {

                                                            console.log(message.notificationGenerated);
                                                        }
                                                    });
                                                }
                                            });

                                            // Offer Accept
                                            deals_controller.updateDealStatus(deal_id, 's', function (result) {

                                                response.json(result);
                                            });
                                        } else  if (action === '0') {

                                            users_controller.getUserById(sender, function (error, result_user) {

                                                if (result_user) {

                                                    var user_params = JSON.stringify(result_user);
                                                    var user_details = JSON.parse(user_params);
                                                    var notification = 'You have decline deal from '+ user_details.name;

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
                                                    var notification = 'Your deal is declined by '+ user_details.name;

                                                    notifications_controller.createNotifications(sender, receiver, notification, offer, function(error, result_notification) {

                                                        if (result_notification) {

                                                            console.log(message.notificationGenerated);
                                                        }
                                                    });
                                                }
                                            });

                                            // Offer Decline
                                            deals_controller.updateDealStatus(deal_id, 'd', function (result) {

                                                response.json(result);
                                            });
                                        } else {

                                            // Deal action Invalid
                                            response.json({

                                                error: true,
                                                message: message.invalidAction
                                            });
                                        }
                                    } else {

                                        // Deal action Already taken
                                        response.json({

                                            error: true,
                                            message: message.dealActionAlready
                                        });
                                    }
                                } else {

                                    // Can't take action your own deal
                                    response.json({

                                        error: true,
                                        message: message.dealActionNotApplicable
                                    });
                                }
                            }
                        });
                    } else {

                        // Deal not exists
                        response.json({

                            error: true,
                            message: message.invalidDeal
                        });
                    }
                }
            });
        } else {

            // Deal not exists
            response.json({

                error: true,
                message: message.invalidDeal
            });
        }
    }
};

exports.updateDealStatus = function (deal, action, callback) {

    deals.update({_id:deal}, {deal_status:action}, function (error, deal) {

        var result;
        if (error) {

            result = {

                error: true,
                error_description: error.message,
                message: message.serverErrorOccurred
            };

            return callback(result);
        } else {

            var action_message;
            if (action === 's') {

                action_message = message.dealAccepted;
            } else if (action === 'd') {

                action_message = message.dealDeclined;
            }

            result = {

                error: false,
                message: action_message
            };

            return callback(result);
        }
    });
};

// Get deal by id
exports.getDealById = function(deal_id, callback) {

    var result;
    if (object_id.isValid(deal_id)) {

        deals.find({_id:deal_id}, function(error, deal) {

            if (error) {

                result = {

                    error: true,
                    message: message.serverErrorOccurred
                };
                return callback(result, null);
            } else {

                if (deal.length) {

                    // Deal exists
                    return callback(null , deals_controller.formatDeals(deal[0]));
                } else {

                    // Deal not exists
                    result = {

                        error: true,
                        message: message.invalidDeal
                    };
                    return callback(result, null);
                }
            }
        });
    } else {

        // Deal not exists
        result = {

            error: true,
            message: message.invalidDeal
        };
        return callback(result, null);
    }
};

// Format Deals
exports.formatDeals = function (deal) {

    var deal_params = JSON.stringify(deal);
    var deal_details = JSON.parse(deal_params);

    var deal_id = deal_details['_id'];

    var deal = {

        deal_id: deal_id,
        for_user: deal_details['for_user'],
        to_user: deal_details['to_user'],
        offer_id: deal_details['offer_id'],
        offer_status: deal_details['offer_status'],
        deal_status: deal_details['deal_status'],
        created_at: deal_details['created_at'],
        updated_at: deal_details['updated_at'],
    };

    return deal;
}