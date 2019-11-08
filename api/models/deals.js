'use strict';
//Models
var mongoose = require('mongoose');

//deals
var dealsSchema = mongoose.Schema({
    for_user: {

        type: String,
        required: "Sender cann't be empty."
    }, to_user: {

        type: String,
        required: "Receiver cann't be empty."
    }, offer_id: {

        type: String,
    }, offer_status: {

        type: [{
            type: String,
            enum: ['a', 'r', 'p']
        }],
        default: ['p']
    }, deal_status: {

        type: [{
            type: String,
            enum: ['s', 'd', 'p']
        }],
        default: ['p']
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
dealsSchema.pre('save', function(next) {

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {

        this.created_at = now;
    }
    next();
});

//Routes will go here
module.exports = mongoose.model('deals', dealsSchema);