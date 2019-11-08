//Files & Modules
var config = require('../../resources/config.js');
var message = require('../../resources/messages.js');
var functions = require('../../resources/functions.js');

//Models
var mongoose = require('mongoose');
var cryptocurrencies = mongoose.model('cryptocurrencies');

//Node Packages
//Validator
//A library of string validators and sanitizers.
var validator = require('validator');

// #cryptocurrencies
exports.createCryptoCurrencies = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['currency', 'symbol'];

    var currency = request.body.currency;
    var currency_symbol = request.body.symbol;

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

        if (functions.isValidString(currency)) {

            if (functions.isValidString(currency_symbol)) {

                cryptocurrencies.findOne({currency:currency}, function(error, result_currency) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            massage: message.serverErrorOccurred
                        });
                    } else {

                        if (result_currency) {

                            // Currency exists
                            response.json({

                                error: true,
                                message: message.currencyExisted
                            });
                        } else {

                            // Currency not exists
                            var new_currency = new cryptocurrencies({

                                currency: currency,
                                currency_symbol: currency_symbol,
                            });
                            new_currency.save(function(error, created_currency) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        error: message.serverErrorOccurred
                                    });
                                } else {

                                    response.json({

                                        error: false,
                                        message: message.currencyCreated
                                    });
                                }
                            });
                        }
                    }
                });
            } else {

                // Invalid Currency Symbol
                response.json({

                    "error" : true,
                    "message" : message.invalidCurrencySymbol
                });
            }
        } else {

            // Invalid Currency
            response.json({

                "error" : true,
                "message" : message.invalidCurrency
            });
        }
    }
};

exports.listCryptoCurrencies = function(request, response) {

    // Cryptocurrencies
    cryptocurrencies.find({ }, function(error, currencies) {

        if (error) {

            response.json({

                error: true,
                error_description: error.message,
                message: message.serverErrorOccurred
            });
        } else {

            var array_currencies = new Array();
            for (var i = 0; i < currencies.length; i++) {

                array_currencies.push(formatCurrencies(currencies[i]));
            }

            response.json({

                error: false,
                currencies: array_currencies,
                message: message.currencyListed
            });
        }
    });
};

// Format Currencies
function formatCurrencies (currency) {

    var currency_params = JSON.stringify(currency);
    var currency_details = JSON.parse(currency_params);

    var currency_id = currency_details['_id'];

    var currency = {

        currency_id: currency_id,
        currency: currency_details['currency'],
        currency_symbol: currency_details['currency_symbol']
    };

    return currency;
}