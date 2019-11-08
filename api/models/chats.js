'use strict';
//Models
var mongoose = require('mongoose');

//chats
var chatsSchema = mongoose.Schema({
    for_user: {

        type: String,
        required: "Sender cann't be empty."
    }, to_user: {

        type: String,
        required: "Receiver cann't be empty."
    }, offer_id: {

        type: String,
    }, body: {

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
chatsSchema.pre('save', function(next) {

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {

        this.created_at = now;
    }
    next();
});

//Routes will go here
module.exports = mongoose.model('chats', chatsSchema);