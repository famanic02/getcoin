'use strict';
//Models
var mongoose = require('mongoose');

//feedbacks
var feedbacksSchema = mongoose.Schema({
    feed_by: {

        type: String,
        required: "User who give feedback cann't be empty."
    }, feed: {

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
feedbacksSchema.pre('save', function(next) {

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {

        this.created_at = now;
    }
    next();
});

//Routes will go here
module.exports = mongoose.model('feedbacks', feedbacksSchema);