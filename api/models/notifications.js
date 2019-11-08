'use strict';
//Models
var mongoose = require('mongoose');

//notifications
var notificationsSchema = mongoose.Schema({
    notification_by: {

        type: String,
        required: "User for which notifcation cann't be empty."
    }, notification_to: {

        type: String,
    }, notification: {

        type: String,
    }, offer: {

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
notificationsSchema.pre('save', function(next) {

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {

        this.created_at = now;
    }
    next();
});

//Routes will go here
module.exports = mongoose.model('notifications', notificationsSchema);