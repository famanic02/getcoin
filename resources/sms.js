//Files & Modules
var config = require('./config.js'); //Configuration

//Node Packages
// Twilio
// Twilio SMS enables your application to send and receive text messages.
var twilio = require('twilio');

var client = new twilio(config.twilio.accountsid, config.twilio.authtoken);

module.exports = {
    sendSMS: function(country_code, to, body) {

        var country = "+1";
        if (country_code) {

            country = country_code;
        }

        var smsOptions = {

            to: country + to,
            from: config.twilio.twilionumber,
            body: body+' is the OTP for your '+config.app.name+' account. Keep this OTP to yourself for account safety.',
        };

        // Send message using callback
        client.messages.create(smsOptions, function(error, result) {

            if (error) {
                console.log('Message '+ error);
            } else {
                console.log('Message sent: ' + JSON.stringify(result));
            }
        });
    }
};