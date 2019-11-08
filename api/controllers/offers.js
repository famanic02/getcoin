//Files & Modules
var email  = require('../../resources/email.js');
var config = require('../../resources/config.js');
var functions = require('../../resources/functions.js');
var message = require('../../resources/messages.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var offers = mongoose.model('offers');
var cryptocurrencies = mongoose.model('cryptocurrencies');

//Controllers
var users_controller = require('./users.js');
var offers_controller = require('./offers.js');
var chats_controller = require('./chats.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

//Node Packages
//Validator
//A library of string validators and sanitizers.
var validator = require('validator');

// #offers
exports.createOffer = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id', 'quantity', 'currency_id', 'type', 'location', 'latitude', 'longitude', 'exchange_rate'];

    var user_id = request.body.user_id;
    var currency_id = request.body.currency_id;
    var quantity = request.body.quantity;
    var location = request.body.location;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    var type = request.body.type;
    var rate = request.body.exchange_rate

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

        if (object_id.isValid(user_id)) {

            users.find({_id:user_id}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        if (object_id.isValid(currency_id)) {

                            cryptocurrencies.find({_id:currency_id}, function(error, currency) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        error: message.serverErrorOccurred
                                    });
                                } else {

                                    if (currency.length) {

                                        // Currency exists
                                        if (validator.isInt(quantity)) {

                                            if (functions.isValidLatLang(latitude+', '+longitude)) {

                                                if (functions.isValidOfferType(type)) {

                                                    if (validator.isFloat) {

                                                        var request_params = JSON.stringify(user[0]);
                                                        var user_details = JSON.parse(request_params);

                                                        var currency_params = JSON.stringify(currency[0]);
                                                        var currency_details = JSON.parse(currency_params);

                                                        var offer_description = '';
                                                        type = type.toLowerCase(type);

                                                        if (type == 'sell') {

                                                            offer_description = user_details['name'] +" want to "+ type +" "+ quantity +" "+ currency_details['currency'] +" at "+ rate +" "+currency_details['currency_symbol'];
                                                            type = 's';
                                                        } else if (type == 'buy') {

                                                            offer_description = user_details['name']+ " want to "+ type +" "+ quantity +" "+ currency_details['currency'] +" at "+ rate +" "+currency_details['currency_symbol'];
                                                            type = 'b';
                                                        }
                                                        var offer = {

                                                            offer_by: user_id,
                                                            offer: offer_description,
                                                            quantity: parseInt(quantity),
                                                            currency: currency_details['currency'],
                                                            unit: currency_details['currency_symbol'],
                                                            offer_type: type,
                                                            location: location,
                                                            latitude: latitude,
                                                            longitude: longitude,
                                                            exchange_rate: rate
                                                        };

                                                        var new_offer = new offers(offer);
                                                        new_offer.coordinates = [ parseFloat(latitude), parseFloat(longitude) ];

                                                        new_offer.save(function(error, offer) {

                                                            if (error) {

                                                                response.json({

                                                                    error: true,
                                                                    error_description: error.message,
                                                                    message: message.serverErrorOccurred
                                                                });
                                                            } else {

                                                                response.json({

                                                                    error: false,
                                                                    message: message.offerCreated
                                                                });

                                                                //Notification to nearest users
                                                                users_controller.getNearestUsers(latitude, longitude, config.defaults.nearestuserdistance, function(error, result_users) {

                                                                    if (!error) {

                                                                        for (var i = 0; i < result_users.length; i++) {

                                                                            var current_user = users_controller.formatUsers(result_users[i], true);
                                                                            var user_id = current_user['user_id'];
                                                                            var user_cloudkey = current_user['cloud_key'];

                                                                            // For send notification
                                                                            var payload = {
                                                                                notification: {

                                                                                    title: user_details['name'],
                                                                                    body: user_details['name'] +" create new offer in your location."
                                                                                }, data: {

                                                                                    for_user_id: String(user_details['user_id']),
                                                                                    to_user_id: String(user_id),
                                                                                    body: user_details['name'] +" create new offer in your location."
                                                                                }
                                                                            };

                                                                            chats_controller.sendReceiverMessage(user_cloudkey, payload, chats_controller.options, function (error, response) {

                                                                                if (error) {

                                                                                    console.log("Error sending message:", error);
                                                                                } else {

                                                                                    console.log("Successfully sent message:", response);
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    } else {

                                                        // Invalid Exchange Rate
                                                        response.json({

                                                            "error" : true,
                                                            "message" : message.invalidExchangeRate
                                                        });
                                                    }
                                                } else {

                                                    // Invalid OfferType
                                                    response.json({

                                                        "error" : true,
                                                        "message" : message.invalidOfferType
                                                    });
                                                }
                                            } else {

                                                // Invalid Latitude & Longitude
                                                response.json({

                                                    "error" : true,
                                                    "message" : message.invalidLatitudeLongitude
                                                });
                                            }
                                        } else {

                                            // Invalid Quantity
                                            response.json({

                                                "error" : true,
                                                "message" : message.invalidQuantity
                                            });
                                        }
                                    } else {

                                        // Currency not exists
                                        response.json({

                                            error: true,
                                            message: message.invalidCurrency
                                        });
                                    }
                                }
                            });
                        } else {

                            // Currency not exists
                            response.json({

                                error: true,
                                message: message.invalidCurrency
                            });
                        }
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

exports.offerList = function(request, response) {

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
                        offers.find({offer_by:id}, function(error, offers) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            } else {

                                var array_offers = new Array();
                                for (var i = 0; i < offers.length; i++) {

                                    array_offers.push(offers_controller.formatOffers(offers[i]));
                                }

                                response.json({

                                    error: false,
                                    offers: array_offers,
                                    message: message.offerListed
                                });
                            }
                        }).sort({created_at:-1});
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

// Users offers
exports.getUserOffers = function(user_id, latitude, longitude, distance, callback) {

    var query = offers.find({'type':'Point', offer_by:user_id}).sort({created_by:-1});

    // Include filter by Max Distance
    if (distance) {

        // Using MongoDB's geospatial querying features.
        query = query.where('coordinates').near({
            center: {
                type: 'Point',
                coordinates: [latitude, longitude]
            },
            // Converting meters to miles
            maxDistance: distance * 1609.34,
            spherical: true
        });
    }

    // Execute Query and Return the Query Results
    query.exec(function(error, result_offers) {

        if (error) {

            return callback(error, null);
        } else {

            var array_offers = new Array();
            for (var i = 0; i < result_offers.length; i++) {

                array_offers.push(offers_controller.formatOffers(result_offers[i]));
            }

            users_controller.getUserById(user_id, function (error, user_details) {

                var offers_details = {};
                offers_details['details'] = users_controller.formatUsers(user_details, false),
                offers_details['offers'] = array_offers
                return callback(null, offers_details);
            });
        }
    });
};

// Get offer by id
exports.getOfferById = function(offer_id, callback) {

    var result;
    if (object_id.isValid(offer_id)) {

        offers.find({_id:offer_id}, function(error, offer) {

            if (error) {

                result = {

                    error: true,
                    message: message.serverErrorOccurred
                };
                return callback(result, null);
            } else {

                if (offer.length) {

                    // Offer exists
                    return callback(null , offers_controller.formatOffers(offer[0]));
                } else {

                    // Offer not exists
                    result = {

                        error: true,
                        message: message.invalidOffer
                    };
                    return callback(result, null);
                }
            }
        });
    } else {

        // User not exists
        result = {

            error: true,
            message: message.invalidUser
        };
        return callback(result, null);
    }
};

// Format Offers
exports.formatOffers = function (offer) {

    var offer_params = JSON.stringify(offer);
    var offer_details = JSON.parse(offer_params);

    var offer_id = offer_details['_id'];

    var offer = {

        offer_id: offer_id,
        type: offer_details['offer_type'],
        status: offer_details['status'],
        created_at: offer_details['created_at'],
        updated_at: offer_details['updated_at'],
        offer_by: offer_details['offer_by'],
        offer: offer_details['offer'],
        quantity: offer_details['quantity'],
        currency: offer_details['currency'],
        unit: offer_details['unit'],
        location: offer_details['location'],
        latitude: offer_details['latitude'],
        longitude: offer_details['longitude'],
        exchange_rate: offer_details['exchange_rate'],
    };

    return offer;
}