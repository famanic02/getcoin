'use strict';
//Controllers
var users = require('../controllers/users.js');
var feedbacks = require('../controllers/feedbacks.js');
var offers = require('../controllers/offers.js');
var notifications = require('../controllers/notifications.js');
var cryptocurrencies = require('../controllers/cryptocurrencies.js');
var chats = require('../controllers/chats');
var deals = require('../controllers/deals.js');
var wallets = require('../controllers/wallets.js');
var others = require('../controllers/others.js');

module.exports = function(app) {

    //# General
        //Registration
        app.route('/api/users/register/').post(users.registeration);

        //Login
        app.route('/api/users/login/mobile').get(users.mobileLogin);
        app.route('/api/users/login/email').get(users.emailLogin);

        //Verify Pin
        app.route('/api/users/verify/pin/').post(users.verifyPin);

        //Forgot Password
        app.route('/api/users/password/forgot/').post(users.forgotPassword);

        //Change Password
        app.route('/api/users/password/change/').post(users.changePassword);

        //Update Password
        app.route('/api/users/update/password/').post(users.updatePassword);

        //Change Password
        app.route('/users/update/language/').post(users.updateLanguage);

        //Change Location
        app.route('/api/users/update/location/').post(users.updateLocation);

        //Profile
        app.route('/api/users/profile').get(users.userProfile);

    //# Users
        //User Listing
        app.route('/api/users/list').get(users.userList);

        //User Mark Active & Inactive
        app.route('/api/users/status/action').post(users.markUserActiveInactive);

    //# Notifications
        //Notification Listing
        app.route('/api/notifications/list').get(notifications.notificationList);

    //# Offers
        //Offer Listing
        app.route('/api/offers/list').get(offers.offerList);

        //Offer Creation
        app.route('/api/offers/create/').post(offers.createOffer);

    //# CryptoCurrencies
        //Currency Listing
        app.route('/api/currencies/list').get(cryptocurrencies.listCryptoCurrencies);

        //Currency Creation
        app.route('/api/currencies/create/').post(cryptocurrencies.createCryptoCurrencies);

    //# Chats
        //Send Message
        app.route('/api/chats/send/').post(chats.sendMessage);

        //Messages Listing
        app.route('/api/chats').get(chats.chatList);

        //Chat Users Listing
        app.route('/api/chats/users/list').get(chats.chatUserList);

        //Offer Action
        app.route('/api/offers/action/').post(chats.confirmMeetingAction);

    //# Deals
        //Deal Listing
        app.route('/api/deals/list').get(deals.dealList);

        //Deal Action
        app.route('/api/deals/action/').post(deals.dealAction);

    //# Wallets
        //Make Wallet Payment
        app.route('/api/wallets/payment/').post(wallets.makePayment);

        //Make Wallet Payment
        app.route('/api/wallets/balance').get(wallets.fetchWalletDetails);

    //# Feedbacks
        //Feedback Creation
        app.route('/api/feedbacks/create/').post(feedbacks.createFeedback);

    //Feedback Creation
        app.route('/api/feedbacks/list').get(feedbacks.feedbackList);

    //# Others
        //Market Price Listing
        app.route('/api/cryptocurrency/marketprice/').get(others.marketPrices);
};