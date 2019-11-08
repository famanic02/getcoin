//Files & Modules
var message = require('../../resources/messages.js');
var config = require('../../resources/config.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var wallets = mongoose.model('wallets');

//Controllers
var offers_controller = require('./offers.js');
var deals_controller = require('./deals.js');
var wallets_controller = require('./wallets.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

//Node Packages
//The HTTP interfaces in Node.js are designed to support many features of the protocol which have been traditionally difficult to use. In particular, large, possibly chunk-encoded, messages.
var http = require("http");

// Blockchain
// Blockchain Bitcoin Developer APIs - NodeJS (https://blockchain.info/api)

// An official Node module for interacting with the Blockchain.info API.
var blockchain = require('blockchain.info');
var blockchain_wallet = blockchain.MyWallet;

// #wallets
// Creating a new Blockchain Wallet
exports.createWallet = function(user_id, password, callback) {

    var api_code = config.blockchain.api_code;
    var user = user_id;
    var pwd = password;

    var result;

    const options = {

        hostname: 'localhost',
        port: 8586,
        path: '/api/v2/create?api_code='+api_code+'&password='+pwd+'&user_id='+user,
        method: 'POST',
    };

    var request = http.request(options, function (response) {

        var wallet_response = '';
        response.on("data", function (chunks) {

            wallet_response += chunks;
        });

        response.on("end", function (error) {

            if (error) {

                result = {

                    error: true,
                    error_description: error.message,
                    message: message.serverErrorOccurred
                };

                callback (result);
            } else {

                var wallet_result = JSON.parse(wallet_response);

                //Generate wallet
                var wallet = {};
                wallet['user_id'] = user_id;
                wallet['guid'] = wallet_result['guid'];
                wallet['address'] = wallet_result['address'];

                var new_wallet = new wallets(wallet);

                new_wallet.save(function(error, created_wallet) {

                    if (error) {

                        result = {

                            error: true,
                            error: message.serverErrorOccurred
                        };
                        callback (result);
                    } else {

                        var result = {

                            error: false,
                            message: message.walletCreated
                        };
                        callback (result);
                    }
                });
            }
        });
    });

    request.on('error', function (error) {

        result = {

            error: true,
            error_description: error.message,
            message: message.serverErrorOccurred
        };

        callback (result);
    });

    // With http.request() one must always call request.end() to signify the end of the request - even if there is no data being written to the request body.
    request.end();
};

// Make Payment
exports.makePayment = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['deal_id'];

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

        deals_controller.getDealById(deal_id, function (error, result_deal) {

            if (result_deal) {

                var deal_params = JSON.stringify(result_deal);
                var deal_details = JSON.parse(deal_params);
                var from = deal_details.for_user;
                var to = deal_details.to_user;
                var offer = deal_details.offer_id;

                wallets_controller.getWalletByUserId(from, function (error, result_from_wallet) {

                    if (result_from_wallet) {

                        users.find({_id:from}, function(error, from_user) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            } else {

                                if (from_user.length) {

                                    // User exists
                                    var from_user_params = JSON.stringify(from_user[0]);
                                    var from_user_details = JSON.parse(from_user_params);

                                    wallets_controller.getWalletByUserId(to, function (error, result_to_wallet) {

                                        if (result_to_wallet) {

                                            offers_controller.getOfferById(offer, function (error, result_offer) {

                                                if (result_offer) {

                                                    var offer_params = JSON.stringify(result_offer);
                                                    var offer_details = JSON.parse(offer_params);

                                                    var amount = offer_details['quantity'];
                                                    var exchange_rate = offer_details['exchange_rate'];

                                                    var path = '/merchant/'+result_from_wallet['guid']+'/payment?to='+result_to_wallet['address']+'&amount='+(amount*exchange_rate)+'&password='+from_user_details['password'];

                                                    // Make Payment
                                                    const options = {

                                                        hostname: 'localhost',
                                                        port: 8586,
                                                        path: path,
                                                        method: 'POST',
                                                    };

                                                    var request = http.request(options, function (payment_response) {

                                                        var wallet_response = '';
                                                        payment_response.on("data", function (chunks) {

                                                            wallet_response += chunks;
                                                        });

                                                        payment_response.on("end", function (error) {

                                                            if (error) {

                                                                response.json({

                                                                    error: true,
                                                                    error_description: error.message,
                                                                    message: message.serverErrorOccurred
                                                                });
                                                            } else {

                                                                var wallet_payment_result = JSON.parse(wallet_response);
                                                                var result = '';
                                                                if (wallet_payment_result.error) {

                                                                    result = message.paymentWalletFailed +' '+ wallet_payment_result.error +'.';
                                                                } else {

                                                                    result = message.paymentWalletSuccess
                                                                }

                                                                response.json({

                                                                    error: true,
                                                                    message: result
                                                                });
                                                            }
                                                        });
                                                    });

                                                    request.on('error', function (error) {

                                                        response.json({

                                                            error: true,
                                                            error_description: error.message,
                                                            message: message.serverErrorOccurred
                                                        });
                                                    });

                                                    // With http.request() one must always call request.end() to signify the end of the request - even if there is no data being written to the request body.
                                                    request.end();
                                                }
                                            });
                                        } else {

                                            // Invalid Wallet
                                            response.json({

                                                "error" : true,
                                                "message" : message.invalidWallet
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

                        // Invalid Wallet
                        response.json({

                            "error" : true,
                            "message" : message.invalidWallet
                        });
                    }
                });
            } else {

                // Invalid Deal
                response.json({

                    "error" : true,
                    "message" : message.invalidDeal
                });
            }
        });
    }
};

// Fetch Wallet Balance
exports.fetchWalletDetails = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id'];

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

        var api_code = config.blockchain.api_code;
        var user_id = request.query.user_id;

        users.find({_id:user_id}, function(error, from_user) {

            if (error) {

                response.json({

                    error: true,
                    error_description: error.message,
                    message: message.serverErrorOccurred
                });
            } else {

                if (from_user.length) {

                    // User exists
                    var from_user_params = JSON.stringify(from_user[0]);
                    var from_user_details = JSON.parse(from_user_params);

                    wallets_controller.getWalletByUserId(user_id, function (error, result_from_wallet) {

                        if (result_from_wallet) {

                            const options = {

                                hostname: 'localhost',
                                port: 8586,
                                path: '/merchant/'+result_from_wallet['guid']+'/balance?api_code='+api_code+'&password='+from_user_details['password'],
                                method: 'POST',
                            };

                            var request = http.request(options, function (balance_response) {

                                var wallet_balance_response = '';
                                balance_response.on("data", function (chunks) {

                                    wallet_balance_response += chunks;
                                });

                                balance_response.on("end", function (error) {

                                    if (error) {

                                        response.json({

                                            error: true,
                                            error_description: error.message,
                                            message: message.serverErrorOccurred
                                        });
                                    } else {

                                        var wallet_balance_result = JSON.parse(wallet_balance_response);

                                        response.json({

                                            error: true,
                                            wallet_details : wallet_balance_result,
                                            message: message.walletDetailRetrevied
                                        });
                                    }
                                });
                            });

                            request.on('error', function (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            });

                            // With http.request() one must always call request.end() to signify the end of the request - even if there is no data being written to the request body.
                            request.end();
                        } else {

                            // Invalid Wallet
                            response.json({

                                "error" : true,
                                "message" : message.invalidWallet
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
    }
};

// Get user wallet by id
exports.getWalletByUserId = function(user_id, callback) {

    var result;
    if (object_id.isValid(user_id)) {

        wallets.find({user_id:user_id}, function(error, wallet) {

            if (error) {

                result = {

                    error: true,
                    message: message.serverErrorOccurred
                };
                return callback(result, null);
            } else {

                if (wallet.length) {

                    // Wallet exists
                    return callback(null , wallets_controller.formatWallets(wallet[0]));
                } else {

                    // Wallet not exists
                    result = {

                        error: true,
                        message: message.invalidWallet
                    };
                    return callback(result, null);
                }
            }
        });
    } else {

        // Wallet not exists
        result = {

            error: true,
            message: message.invalidWallet
        };
        return callback(result, null);
    }
};

// Format Wallets
exports.formatWallets = function (wallet) {

    var wallet_params = JSON.stringify(wallet);
    var wallet_details = JSON.parse(wallet_params);

    var wallet_id = wallet_details['_id'];

    var wallet = {

        wallet_id: wallet_id,
        user_id: wallet_details['user_id'],
        guid: wallet_details['guid'],
        address: wallet_details['address'],
        status: wallet_details['status'],
        created_at: wallet_details['created_at'],
        updated_at: wallet_details['updated_at'],
    };

    return wallet;
}