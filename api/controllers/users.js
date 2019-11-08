//Files & Modules
var emails  = require('../../resources/email.js');
var config = require('../../resources/config.js');
var sms  = require('../../resources/sms.js');
var functions = require('../../resources/functions.js');
var message = require('../../resources/messages.js');

//Models
var mongoose = require('mongoose');
var users = mongoose.model('users');
var offers = mongoose.model('offers');

//Controllers
var users_controller = require('./users.js');
var chats_controller = require('./chats.js');
var offers_controller = require('./offers.js');
var wallets_controller = require('./wallets.js');

//Define ObjectId
var object_id = mongoose.Types.ObjectId;

//Node Packages
//Validator
//A library of string validators and sanitizers.
var validator = require('validator');

//Crypto
//Deals with cryptography
var crypto = require('crypto');

//Path
//Provides utilities for handling and transforming file paths.
var path = require('path');

//File System
//The fs module provides an API for interacting with the file system
var file_system = require('fs')

//Multer
//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(request, file, callback) {

        callback(null, "./public/avatar/");
    },
    filename: function(request, file, callback) {

        crypto.pseudoRandomBytes(16, function(error, raw) {

            if (error) {

                return callback(error);
            } else {

                callback(null, raw.toString('hex') + path.extname(file.originalname));
            }
        });
    }
});
var upload = multer({ storage: storage }).array("image");

//# Gerenal
exports.registeration = function(request, response) {

    upload(request, response, function(upload_error) {

        if (request.files) {

            var file_details = request.files[0];
            var avatar;
            if (file_details) {

                avatar = file_details.filename;
            } else {

                avatar = 'default.png'
            }

            // Verify Required Parameters
            var required_fields = ['name', 'email', 'mobile', 'country_code', 'password', 'location', 'latitude', 'longitude'];

            var error = false;
            var error_fields = "";

            var request_params = JSON.stringify(request.body);
            var objectValue = JSON.parse(request_params);

            required_fields.forEach(function(element) {

                if (!objectValue[element]) {

                    error = true;
                    error_fields += element + ', ';
                }
            });

            if (error) {

                // Required field(s) are missing or empty
                response.json({

                    "error" : true,
                    "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
                });
            } else {

                var name = request.body.name;
                var email = request.body.email;
                var mobile = request.body.mobile;
                var country_code = request.body.country_code;
                var password = request.body.password;
                var location = request.body.location;
                var latitude = request.body.latitude;
                var longitude = request.body.longitude;
                var user_token = request.body.firebase_token;

                if (functions.isValidName(name)) {

                    if (functions.isValidEmail(email)) {

                        if (validator.isMobilePhone(mobile, 'any')) {

                            if (functions.isValidPassword(password)) {

                                if (functions.isValidLatLang(latitude+', '+longitude)) {

                                    users.findOne({email:email}, function(error, user) {

                                        if (!error && user) {

                                            //User exists
                                            response.json({

                                                error: true,
                                                message : message.userExisted
                                            });
                                        } else {

                                            users.findOne({mobile:mobile}, function(error, user) {

                                                if (!error && user) {

                                                    //User exists
                                                    response.json({

                                                        error: true,
                                                        message : message.userMobileExisted
                                                    });
                                                } else {

                                                    //User not exists
                                                    var user_params = {

                                                        name: name,
                                                        email: email,
                                                        mobile: mobile,
                                                        country_code: country_code,
                                                        password: password,
                                                        location: location,
                                                        latitude: latitude,
                                                        longitude: longitude,
                                                    };

                                                    var new_user = new users(user_params);
                                                    new_user.coordinates = [ parseFloat(request.body.latitude), parseFloat(request.body.longitude) ];
                                                    new_user.image = config.server.url+'avatar/'+avatar;

                                                    new_user.save(function(error, user) {

                                                        if (error) {

                                                            response.json({

                                                                error: true,
                                                                error_description: error.message,
                                                                error: message.serverErrorOccurred
                                                            });
                                                        } else {

                                                            var created_user = users_controller.formatUsers(user, false);
                                                            var user_id = created_user['user_id'];

                                                            // Welcome email send
                                                            emails.sendHtmlEmail(request.body.email, 'Welcome to '+config.app.name+'!', '<table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="500" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td> <table width="500" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="420" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="left" valign="top" style="font-size:17px; line-height:24px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;"> <a href="'+config.app.url+'" style="color: #4585f3; text-decoration:none" class="hover" target="_blank" rel="external">'+config.app.name+'</a> is a mobile cross-platform application that allows users to exchange FIAT for cryptocurrencies and viceversa using the nearby function like localbitcoins you can see the offers around you and pick your one.</td> </tr> <tr> <td align="left" height="15" valign="top" style="border-top:1px solid #e6e6e6;font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-size:17px; line-height:26px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;">Thank you for using '+config.app.name+'!</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table align="center" width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <table width="500" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-family: Helvetica, arial, sans-serif; font-size: 13px; line-height: 20px;color: #7f7f7f; padding-left: 45px; padding-right: 45px">© 2018 '+config.app.name+'</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table>');

                                                            // Wallet creation
                                                            wallets_controller.createWallet(user_id , password, function (result) {

                                                                if (result['error']) {

                                                                    console.log("Error while create wallet: "+ result['error_description']);
                                                                } else {

                                                                    console.log(result['message']);
                                                                }
                                                            });

                                                            if (user_token) {

                                                                users.update({_id:user_id}, {cloud_key: user_token}, function (error, user) {

                                                                    if (error) {

                                                                        console.log("Error while trying to update cloud key: "+error);
                                                                    } else {

                                                                        console.log("Updated cloud key successfully.");
                                                                    }
                                                                });
                                                            }

                                                            response.json({

                                                                error: false,
                                                                message: message.userCreated
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {

                                    // Invalid Latitude & Longitude
                                    response.json({

                                        "error" : true,
                                        "message" : message.invalidLatitudeLongitude
                                    });
                                }
                            } else {

                                // Invalid Password
                                response.json({

                                    "error" : true,
                                    "message" : message.invalidPassword
                                });
                            }
                        } else {

                            // Invalid Mobile
                            response.json({

                                "error" : true,
                                "message" : message.invalidMobile
                            });
                        }
                    } else {

                        // Invalid Email
                        response.json({

                            "error" : true,
                            "message" : message.invalidEmail
                        });
                    }
                } else {

                    // Invalid Name
                    response.json({

                        "error" : true,
                        "message" : message.invalidName
                    });
                }
            }
        } else {

            // Required field(s) are missing or empty
            response.json({

                "error" : true,
                "message" : 'Required field(s) image is missing or empty!'
            });
        }
    });
};

exports.mobileLogin = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['mobile'];

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.query);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        var mobile = request.query.mobile;

        if (validator.isMobilePhone(mobile, 'any')) {

            users.find({mobile:mobile}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        // Update Pin
                        var generated_pin = Math.floor(1000 + Math.random() * 9000);

                        var request_params = JSON.stringify(user[0]);
                        var user_details = JSON.parse(request_params);

                        if (user_details['status'] != 'i') {

                            users.findOneAndUpdate({mobile:mobile}, {pin:generated_pin}, function (error, user) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        message: message.serverErrorOccurred
                                    });
                                } else {

                                    // Send pin on mobile
                                    sms.sendSMS(user_details['country_code'], mobile, generated_pin);

                                    response.json({

                                        error: false,
                                        verification_data: { pin: generated_pin },
                                        message: message.verificationPinInstructions
                                    });
                                }
                            });
                        } else {

                            // User inactive
                            response.json({

                                error: true,
                                message: message.inactiveUser
                            });
                        }
                    } else {

                        // User not exists
                        response.json({

                            error: true,
                            message: message.loginFailed
                        });
                    }
                }
            });
        } else {

            // Invalid Mobile
            response.json({

                "error" : true,
                "message" : message.invalidMobile
            });
        }
    }
};

exports.verifyPin = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['source', 'pin'];

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        var source = request.body.source;
        var pin = request.body.pin;

        if (functions.isValidEmail(source)) {

            if (functions.isValidPin(pin)) {

                users.find({email:source, pin:pin}, function(error, user) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            error: message.serverErrorOccurred
                        });
                    } else {

                        if (user.length) {

                            // User exists
                            response.json({

                                error: false,
                                user : users_controller.formatUsers(user[0], false),
                                message: message.successVerified
                            });
                        } else {

                            // User not exists
                            response.json({

                                error: true,
                                message: message.incorrectCredentials
                            });
                        }
                    }
                });
            } else {

                // Invalid Pin
                response.json({

                    error: true,
                    message: message.invalidPin
                });
            }
        } else {

            //Locale identifier consists of at least a language identifier and a region identifier.
            if (validator.isMobilePhone(source, 'any')) {

                if (functions.isValidPin(pin)) {

                    users.find({mobile:source, pin:pin}, function(error, user) {

                        if (error) {

                            response.json({

                                error: true,
                                error_description: error.message,
                                error: message.serverErrorOccurred
                            });
                        } else {

                            if (user.length) {

                                // User exists
                                response.json({

                                    error: false,
                                    user : users_controller.formatUsers(user[0], false),
                                    message: message.successVerified
                                });
                            } else {

                                // User not exists
                                response.json({

                                    error: true,
                                    message: message.invalidPin
                                });
                            }
                        }
                    });
                } else {

                    // Invalid Pin
                    response.json({

                        error: true,
                        message: message.invalidPin
                    });
                }
            } else {

                response.json({

                    "error" : true,
                    message: 'Please make sure you enter the mobile associated with your '+config.app.name+' account.'
                });
            }
        }
    }
};

exports.emailLogin = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['email', 'password'];

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.query);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        var email = request.query.email;
        var password = request.query.password;

        if (functions.isValidEmail(email)) {

            if (functions.isValidPassword(password)) {

                users.find({email:email, password:password}, function(error, user) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            error: message.serverErrorOccurred
                        });
                    } else {

                        if (user.length) {

                            // User exists

                            var user_details = users_controller.formatUsers(user[0], false)
                            if (user_details['status'] != 'i') {

                                response.json({

                                    error: false,
                                    user : user_details,
                                    message: message.loginSuccess
                                });
                            } else {

                                // User inactive
                                response.json({

                                    error: true,
                                    message: message.inactiveUser
                                });
                            }
                        } else {

                            // User not exists
                            response.json({

                                error: true,
                                message: message.loginFailed
                            });
                        }
                    }
                });
            } else {

                // Invalid Password
                response.json({

                    "error" : true,
                    "message" : message.invalidPassword
                });
            }
        } else {

            // Invalid Email
            response.json({

                "error" : true,
                "message" : message.invalidEmail
            });
        }
    }
};

exports.forgotPassword = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['source'];

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        var source = request.body.source;

        if (validator.isEmail(source)) {

            users.find({email:source}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        emails.sendHtmlEmail(source, 'Your '+config.app.name+' Password Reset Instructions.!', '<table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="500" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td> <table width="500" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="420" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="left" valign="top" style="font-size:17px; line-height:24px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;"> You have just requested a password reset for the '+config.app.name+' account with email address <a style="color: #4585f3; text-decoration:none" class="hover" target="_blank" rel="external">'+user[0].email+'</a>.</td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center"> <table cellspacing="0" cellpadding="0"> <tbody> <tr> <td bgcolor="#da4030" style="border-radius:45px"> <a href="'+config.app.url+'/changepassword/'+user[0].id+'" style="font-family:Helvetica,Arial,sans-serif; font-size: 17px;color:#ffffff;text-decoration:none;display:inline-block;padding:12px 40px;border-style: solid; border-width: 1px; border-color: #cf2d2d; border-radius: 45px;background-color: #da4030;background: -webkit-linear-gradient(top, #e04f42 0%, #d0352c 100%); background: -moz-linear-gradient(top, #e04f42 0%, #d0352c 100%); background: -o-linear-gradient(top, #e04f42 0%, #d0352c 100%); background: -ms-linear-gradient(top, #e04f42 0%, #d0352c 100%); background: linear-gradient(to bottom, #e04f42 0%, #d0352c 100%);font-weight:bold" target="_blank" class="devicebutton" rel="external">Reset Password</a> </td> </tr> </tbody> </table> </td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td align="left" height="15" valign="top" style="border-top:1px solid #e6e6e6;font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-size:17px; line-height:26px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;">Thank you for using '+config.app.name+'!</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table align="center" width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <table width="500" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-family: Helvetica, arial, sans-serif; font-size: 13px; line-height: 20px;color: #7f7f7f; padding-left: 45px; padding-right: 45px">© 2018 '+config.app.name+'</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table>');

                        response.json({

                            error: false,
                            message:message.passwordResetInstructions
                        });
                    } else {

                        // User not exists
                        response.json({

                            error: true,
                            message: 'Please try again and make sure you enter the email address associated with your '+config.app.name+' account.'
                        });
                    }
                }
            });
        } else {

            //Locale identifier consists of at least a language identifier and a region identifier.
            if (validator.isMobilePhone(source, 'any')) {

                users.find({mobile:source}, function(error, user) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            error: message.serverErrorOccurred
                        });
                    } else {

                        if (user.length) {

                            // Update Pin
                            var generated_pin = Math.floor(1000 + Math.random() * 9000);

                            users.update({pin:generated_pin}, function (error, user) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        message: message.serverErrorOccurred
                                    });
                                } else {

                                    response.json({

                                        error: false,
                                        verification_data: { pin: generated_pin },
                                        message: message.verificationPinInstructions
                                    });
                                }
                            });
                        } else {

                            // User not exists
                            response.json({

                                error: true,
                                message: 'Please try again and make sure you enter the mobile associated with your '+config.app.name+' account.'
                            });
                        }
                    }
                });
            } else {

                response.json({

                    "error" : true,
                    message: 'Please make sure you enter the mobile associated with your '+config.app.name+' account.'
                });
            }
        }
    }
};

exports.userProfile = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id'];

    var id = request.query.user_id;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.query);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        if (object_id.isValid(id)) {

            users.find({_id:id}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        response.json({

                            error: true,
                            user: users_controller.formatUsers(user[0], false),
                            error: message.userProfilRetrevied
                        });
                    } else {

                        // User not exists
                        response.json({

                            error: true,
                            message: message.invalidUser
                        });
                    }
                }
            });
        } else {

            // User not exists
            response.json({

                error: true,
                message: message.invalidUser
            });
        }
    }
};

exports.changePassword = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['source', 'old_password', 'new_password'];

    var old_password = request.body.old_password;
    var new_password = request.body.new_password;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        var source = request.body.source;

        if (functions.isValidEmail(source)) {

            if (functions.isValidPassword(old_password)) {

                users.find({email:source, password:old_password}, function(error, user) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            error: message.serverErrorOccurred
                        });
                    } else {

                        if (user.length) {

                            if (functions.isValidPassword(new_password)) {

                                // User exists
                                users.update({email:source}, {password: new_password}, function (error, user) {

                                    if (error) {

                                        response.json({

                                            error: true,
                                            error_description: error.message,
                                            message: message.serverErrorOccurred
                                        });
                                    } else {

                                        emails.sendHtmlEmail(source, 'Your '+config.app.name+' password has been reset!', '<table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="500" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td> <table width="500" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="center"> <table width="420" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="left" valign="top" style="font-size:17px; line-height:24px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;"> The password for your '+config.app.name+' account <a style="color: #4585f3; text-decoration:none" class="hover" target="_blank" rel="external">'+source+'</a> was successfully reset.</td> </tr> <tr> <td colspan="2" height="15" align="center" style="font-size:1px;line-height:1px;">&nbsp;</td> </tr> <tr> <td align="left" height="15" valign="top" style="border-top:1px solid #e6e6e6;font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-size:17px; line-height:26px; font-family:Helvetica Neue, Arial, sans-serif; color:#666666; font-weight:normal;">Thank you for using '+config.app.name+'!</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table align="center" width="100%" bgcolor="#f2f2f2" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr> <td align="center"> <table width="500" cellpadding="0" cellspacing="0" border="0" align="center"> <tbody> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> <tr> <td align="center" valign="top" style="font-family: Helvetica, arial, sans-serif; font-size: 13px; line-height: 20px;color: #7f7f7f; padding-left: 45px; padding-right: 45px">© 2018 '+config.app.name+'</td> </tr> <tr> <td align="left" height="15" valign="top" style="font-size:1px; line-height:1px;">&nbsp;</td> </tr> </tbody> </table> </td> </tr> </tbody> </table>');

                                        response.json({

                                            error: false,
                                            message: 'Your '+config.app.name+' password has been reset!'
                                        });
                                    }
                                });
                            } else {

                                // Invalid Password
                                response.json({

                                    "error" : true,
                                    "message" : message.invalidNewPassword
                                });
                            }
                        } else {

                            // User not exists
                            response.json({

                                error: true,
                                message: message.incorrectCredentials
                            });
                        }
                    }
                });
            } else {

                // Invalid Password
                response.json({

                    "error" : true,
                    "message" : message.invalidOldPassword
                });
            }
        } else {

            //Locale identifier consists of at least a language identifier and a region identifier.
            if (validator.isMobilePhone(source, 'any')) {

                if (functions.isValidPassword(old_password)) {

                    users.find({email:source, password:old_password}, function(error, user) {

                        if (error) {

                            response.json({

                                error: true,
                                error_description: error.message,
                                error: message.serverErrorOccurred
                            });
                        } else {

                            if (user.length) {

                                // User exists
                                if (functions.isValidPassword(new_password)) {

                                    users.update({mobile:source}, {password: new_password}, function (error, user) {

                                        if (error) {

                                            response.json({

                                                error: true,
                                                error_description: error.message,
                                                message: message.serverErrorOccurred
                                            });
                                        } else {

                                            response.json({

                                                error: false,
                                                message: 'Your '+config.app.name+' password has been reset!'
                                            });
                                        }
                                    });
                                } else {

                                    // Invalid Password
                                    response.json({

                                        "error" : true,
                                        "message" : message.invalidNewPassword
                                    });
                                }
                            } else {

                                // User not exists
                                response.json({

                                    error: true,
                                    message: message.incorrectCredentials
                                });
                            }
                        }
                    });
                } else {

                    // Invalid Password
                    response.json({

                        "error" : true,
                        "message" : message.invalidOldPassword
                    });
                }
            } else {

                response.json({

                    "error" : true,
                    message: 'Please make sure you enter the mobile associated with your '+config.app.name+' account.'
                });
            }
        }
    }
};

exports.updatePassword = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id', 'old_password', 'new_password'];

    var id = request.body.user_id;
    var old_password = request.body.old_password;
    var new_password = request.body.new_password;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        if (object_id.isValid(id)) {

            if (functions.isValidPassword(old_password)) {

                users.find({_id:id, password:old_password}, function(error, user) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            message: message.serverErrorOccurred
                        });
                    } else {

                        if (user.length) {

                            // User exists
                            if (functions.isValidPassword(new_password)) {

                                users.update({_id:id}, {password:new_password}, function (error, user) {

                                    if (error) {

                                        response.json({

                                            error: true,
                                            error_description: error.message,
                                            message: message.serverErrorOccurred
                                        });
                                    } else {

                                        response.json({

                                            error: false,
                                            message: message.passwordUpdated
                                        });
                                    }
                                });
                            } else {

                                // Invalid Password
                                response.json({

                                    "error" : true,
                                    "message" : message.invalidNewPassword
                                });
                            }
                        } else {

                            // User not exists
                            response.json({

                                error: true,
                                message: message.incorrectCredentials
                            });
                        }
                    }
                });
            } else {

                // Invalid Password
                response.json({

                    "error" : true,
                    "message" : message.invalidOldPassword
                });
            }
        } else {

            // User not exists
            response.json({

                error: true,
                message: message.invalidUser
            });
        }
    }
};

exports.updateLanguage = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id', 'language', 'language_code'];

    var id = request.body.user_id;
    var language = request.body.language;
    var language_code = request.body.language_code; //A language code is a code that assigns letters or numbers as identifiers or classifiers for languages. ISO 639 is a set of international standards that lists short codes for language names. The complete list of three-letter codes defined in part two (ISO 639-2) of the standard, including the corresponding two-letter (ISO 639-1) codes where they exist.

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        if (object_id.isValid(id)) {

            if (functions.isValidLanguage(language)) {

                users.find({_id:id}, function(error, user) {

                    if (error) {

                        response.json({

                            error: true,
                            error_description: error.message,
                            error: message.serverErrorOccurred
                        });
                    } else {

                        if (user.length) {

                            // User exists
                            if (functions.isValidLanguageCode(language_code)) {

                                users.update({_id:id}, {language:language, language_code: language_code}, function (error, user) {

                                    if (error) {

                                        response.json({

                                            error: true,
                                            error_description: error.message,
                                            message: message.serverErrorOccurred
                                        });
                                    } else {

                                        response.json({

                                            error: false,
                                            message: message.languageUpdated
                                        });
                                    }
                                });
                            } else {

                                // Invalid Language Code
                                response.json({

                                    error: true,
                                    message: message.invalidLangugaeCode
                                });
                            }
                        } else {

                            // User not exists
                            response.json({

                                error: true,
                                message: message.invalidUser
                            });
                        }
                    }
                });
            } else {

                // Invalid Language
                response.json({

                    error: true,
                    message: message.invalidLangugae
                });
            }
        } else {

            // User not exists
            response.json({

                error: true,
                message: message.invalidUser
            });
        }
    }
};

exports.updateLocation = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id', 'location', 'latitude', 'longitude'];

    var id = request.body.user_id;
    var location = request.body.location;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        if (object_id.isValid(id)) {

            users.find({_id:id}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        error: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        // User exists
                        if (functions.isValidLatLang(latitude+', '+longitude)) {

                            var coordinates = [ parseFloat(latitude), parseFloat(longitude) ];
                            users.update({_id:id}, {location:location, latitude: latitude, longitude: longitude,  coordinates: coordinates}, function (error, user) {

                                if (error) {

                                    response.json({

                                        error: true,
                                        error_description: error.message,
                                        message: message.serverErrorOccurred
                                    });
                                } else {

                                    response.json({

                                        error: false,
                                        message: message.locationUpdated
                                    });
                                }
                            });
                        } else {

                            // Invalid Latitude & Longitude
                            response.json({

                                "error" : true,
                                "message" : message.invalidLatitudeLongitude
                            });
                        }
                    } else {

                        // User not exists
                        response.json({

                            error: true,
                            message: message.invalidUser
                        });
                    }
                }
            });
        } else {

            // User not exists
            response.json({

                error: true,
                message: message.invalidUser
            });
        }
    }
};

//# Users
exports.userList = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['latitude', 'longitude', 'distance'];

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.query);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        // Grab all of the query parameters from the body.
        var latitude = request.query.latitude;
        var longitude = request.query.longitude;
        var distance = request.query.distance;

        if (functions.isValidLatLang(latitude+', '+longitude)) {

            if (validator.isFloat(distance)) {

                users_controller.getNearestUsers(latitude, longitude, distance, function(error, result_users) {

                    var array_users = new Array();
                    for (var i = 0; i < result_users.length; i++) {

                        var current_user = users_controller.formatUsers(result_users[i], false);
                        offers_controller.getUserOffers(current_user['user_id'], current_user['latitude'], current_user['longitude'], distance, function(error, result_offers) {

                            array_users.push(result_offers);
                            if (current_user['user_id'] == result_offers['details']['user_id']) {

                                response.json({

                                    error: false,
                                    user: array_users,
                                    message:message.userListed
                                });
                            }
                        });
                    }
                });
            } else {

                // Invalid Distance
                response.json({

                    "error" : true,
                    "message" : message.invalidDistance
                });
            }
        } else {

            // Invalid Latitude & Longitude
            response.json({

                "error" : true,
                "message" : message.invalidLatitudeLongitude
            });
        }
    }
};

exports.markUserActiveInactive = function(request, response) {

    // Verify Required Parameters
    var required_fields = ['user_id'];

    var id = request.body.user_id;

    var error = false;
    var error_fields = "";

    var request_params = JSON.stringify(request.body);
    var objectValue = JSON.parse(request_params);

    required_fields.forEach(function(element) {

        if (!objectValue[element]) {

            error = true;
            error_fields += element + ', ';
        }
    });

    if (error) {

        // Required field(s) are missing or empty
        response.json({

            "error" : true,
            "message" : 'Required field(s) ' + error_fields + 'is missing or empty!'
        });
    } else {

        if (object_id.isValid(id)) {

            users.find({_id:id}, function(error, user) {

                if (error) {

                    response.json({

                        error: true,
                        error_description: error.message,
                        message: message.serverErrorOccurred
                    });
                } else {

                    if (user.length) {

                        var current_status = user[0].status[0];
                        var new_status;
                        if (current_status == 'a') {

                            new_status = 'i';
                        } else {

                            new_status = 'a';
                        }

                        // User exists
                        users.update({_id:id}, {status:new_status}, function (error, user) {

                            if (error) {

                                response.json({

                                    error: true,
                                    error_description: error.message,
                                    message: message.serverErrorOccurred
                                });
                            } else {

                                var new_message;
                                if (new_status == 'a') {

                                    new_message = message.activeSuccessully
                                } else {

                                    new_message = message.inactiveSuccessully
                                }
                                response.json({

                                    error: false,
                                    message: new_message
                                });
                            }
                        });
                    } else {

                        // User not exists
                        response.json({

                            error: true,
                            message: message.incorrectCredentials
                        });
                    }
                }
            });
        } else {

            // User not exists
            response.json({

                error: true,
                message: message.invalidUser
            });
        }
    }
};

// Users nearest users
exports.getNearestUsers = function(latitude, longitude, distance, callback) {

    var query = users.find({'type':'Point'}).sort({created_at:-1});

    // Include filter by Max Distance
    if (distance) {

        // Using MongoDB's geospatial querying features.
        query = query.where('coordinates').near({
            center: {
                type: 'Point',
                coordinates: [latitude, longitude]
            },
            // Converting meters to miles
            maxDistance: distance * 1609.34,
            spherical: true
        });
    }

    // Execute Query and Return the Query Results
    query.exec(function(error, result_users) {

        if (error) {

            return callback(error, null);
        } else {

            var array_users = new Array();
            for (var i = 0; i < result_users.length; i++) {

                array_users.push(users_controller.formatUsers(result_users[i], true));
            }
            return callback(null, array_users);
        }
    });
};

// Get user by id
exports.getUserById = function(user_id, callback) {

    var result;
    if (object_id.isValid(user_id)) {

        users.find({_id:user_id}, function(error, user) {

            if (error) {

                result = {

                    error: true,
                    message: message.serverErrorOccurred
                };
                return callback(result, null);
            } else {

                if (user.length) {

                    // User exists
                    return callback(null , users_controller.formatUsers(user[0], false));
                } else {

                    // User not exists
                    result = {

                        error: true,
                        message: message.invalidUser
                    };
                    return callback(result, null);
                }
            }
        });
    } else {

        // User not exists
        result = {

            error: true,
            message: message.invalidUser
        };
        return callback(result, null);
    }
};

// Get all users
exports.getAllUsers = function(callback) {

    var result;
    users.find({}, function(error, result_users) {

        if (error) {

            result = {

                error: true,
                message: message.serverErrorOccurred
            };
            return callback(result, null);
        } else {

            var array_users = new Array();
            for (var i = 0; i < result_users.length; i++) {

                array_users.push(users_controller.formatUsers(result_users[i], true));
            }
            return callback(null, array_users);
        }
    }).sort({created_at:-1});
};

// Format users
exports.formatUsers = function (user, is_cloud_key) {

    var user_params = JSON.stringify(user);
    var user_details = JSON.parse(user_params);

    var user_id;
    if (user_details['user_id']) {

        user_id = user_details['user_id'];
    } else {

        user_id = user_details['_id'];
    }

    var user_cloud_key = null;
    if (is_cloud_key) {

        user_cloud_key = user_details['cloud_key'];
    }

    var latitude = user_details['latitude'];
    var longitude = user_details['longitude'];

    var user = {

        user_id: user_id,
        name: user_details['name'],
        email: user_details['email'],
        mobile: user_details['mobile'],
        image: user_details['image'],
        location: user_details['location'],
        latitude: latitude,
        longitude: longitude,
        language: user_details['language'],
        language_code: user_details['language_code'],
        created_at: user_details['created_at'],
        updated_at: user_details['updated_at'],
        status: user_details['status'],
        cloud_key: user_cloud_key
    };

    return user;
}
