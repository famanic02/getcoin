//Files & Modules
var message = require('../../resources/messages.js');

//Node Packages
//The HTTP interfaces in Node.js are designed to support many features of the protocol which have been traditionally difficult to use. In particular, large, possibly chunk-encoded, messages.
//HTTPS is the HTTP protocol over TLS/SSL
var https = require("https");

// #Market Prices and Exchanges Rates API
exports.marketPrices = function(request, response) {

    https.get('https://blockchain.info/ticker', function (result_response) {

        var buffer_response = '';

        result_response.on("data", function (chunks) {

            buffer_response += chunks;
        });

        result_response.on("end", function (error) {

            if (error) {

                response.json({

                    error: true,
                    error_description: error.message,
                    message: message.serverErrorOccurred
                });
            } else {

                response.json({

                    error: false,
                    marketPrices: JSON.parse(buffer_response),
                    message: message.marketPriceListed
                });
            }
        });
    });
};