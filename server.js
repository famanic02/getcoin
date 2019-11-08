//Express
var express = require('express');
var app = express();

//Configuration
var configuration = require('./resources/config.js');

//Body-parser
//For parsing JSON and url-encoded data
var bodyParser = require('body-parser');

//For parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

//For parsing application/json
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/x-www-form-urlencoded' }));

//Seting up server to accept cross-origin browser requests
app.use(function(request, response, next) {
    //Allow cross origin requests
    response.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Allow-Credentials", true);
    next();
});

//Static files
app.use(express.static('public'));

//Set it as the templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

//Express-session
var session = require('express-session');
app.use(session({secret: 'its a secret!', resave:true, saveUninitialized:true })); //Express-Session middleware

//Mongodb
//For document Modeling in Node for MongoDB
var mongoose =require('mongoose');

//Mongodb database path
var databaseURI = configuration.database.url;
mongoose.connect(databaseURI).then(() => { console.log('Connected to MongoDB at', databaseURI); }).catch(error => { console.log('Database connection error: '+ error.message); })

//Morgan
//For logging network requests
var morgan  = require('morgan')
app.use(morgan('dev'));

//Created model load
var usersModel = require('./api/models/users.js');
var feedbacksModel = require('./api/models/feedbacks.js');
var notificationsModel = require('./api/models/notifications.js');
var offersModel = require('./api/models/offers.js');
var cryptoCurrenciesModel = require('./api/models/cryptocurrencies.js');
var chatsModel = require('./api/models/chats.js');
var dealsModel = require('./api/models/deals.js');
var walletsModel = require('./api/models/wallets.js');

//Importing router
var adminRoute = require('./admin/admin.js');
app.use('/admin', adminRoute);

//Importing router
var usersRoute  = require('./api/routes/routes.js');
usersRoute(app);

//Messages
var message = require('./resources/messages.js');

//An error handling middleware
app.use(function(error, request, response) {

    response.json({

        "error" : true,
        "error_description" : error.message,
        "message" : message.somethingWrong
    });
});

app.use(function(error, request, response, next) {

    response.json({

        "error" : true,
        "error_description" : error.message,
        "message" : message.invalidURL
    });
});

app.listen(process.env.PORT || configuration.server.port, function(){

    console.log('"Get Coins" server listening on port '+ configuration.server.port);
});