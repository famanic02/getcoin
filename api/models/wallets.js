'use strict';
//Models
var mongoose = require('mongoose');

//wallets
var walletSchema = mongoose.Schema({
    user_id:{

        type: String,
        required: "User field cann't be empty."
    }, guid:{

        type: String,
    }, address:{

        type: String,
    }, created_at: {

        type: Date,
        default: Date.now
    }, updated_at: {

        type: Date,
        default: Date.now
    }, status: {

        type: [{
            type: String,
            enum: ['a', 'i']
        }],
        default: ['a']
    }
});

// Sets the created_at parameter equal to the current time
walletSchema.pre('save', function(next) {

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {

        this.created_at = now;
    }
    next();
});

//Routes will go here
module.exports = mongoose.model('wallets', walletSchema);