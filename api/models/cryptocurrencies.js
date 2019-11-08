'use strict';
//Models
var mongoose = require('mongoose');

// cryptocurrencies
var cryptoCurrenciesSchema = mongoose.Schema({
    currency: {

        type: String,
        required: "Currency cann't be empty."
    }, currency_symbol: {

        type: String,
    }, created_at: {

        type: Date,
        default: Date.now
    }, updated_at: {

        type: Date,
        default: Date.now
    }
});

// Sets the created_at parameter equal to the current time
cryptoCurrenciesSchema.pre('save', function(next) {

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {

        this.created_at = now;
    }
    next();
});

//Routes will go here
module.exports = mongoose.model('cryptocurrencies', cryptoCurrenciesSchema);