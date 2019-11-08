//Native RegExp compatible regular expressions for JavaScript.
var methods = {};

methods.isValidName = function(name) {

    var name_regex = new RegExp(/^[A-Za-z\s]{1,}$/);
    if (name_regex.test(name)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidEmail = function(email) {

    var email_regex = new RegExp(/([A-Za-z0-9\.\-\_\!\#\$\%\&\'\*\+\/\=\?\^\`\{\|\}]+)\@([A-Za-z0-9-_]+)(\.[A-Za-z]{2,3})/);
    if (email_regex.test(email)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidString = function(string) {

    console.log(string);
    var string_regex = new RegExp(/^[A-Za-z\\s]{1,}$/);
    if (string_regex.test(string)) {

        return true;
    } else {

        return false;
    }
};


methods.isValidPassword = function(password) {

    var password_regex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@#$%_-]{6,8}$/);
    if (password_regex.test(password)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidLatLang = function(latLang) {

    var lat_lang_regex = new RegExp("^(\\-?\\d+(\\.\\d+)?),\\s*(\\-?\\d+(\\.\\d+)?)$");
    if (lat_lang_regex.test(latLang)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidPin = function(pin) {

    var pin_regex = new RegExp(/^[0-9]{4}$/);
    if (pin_regex.test(pin)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidLanguage = function(language) {

    var language_regex = new RegExp(/^[a-zA-Z\s()-]{1,}$/);
    if (language_regex.test(language)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidLanguageCode = function(language_code) {

    var language_code_regex = new RegExp(/^[a-z]{3}$/);
    if (language_code_regex.test(language_code)) {

        return true;
    } else {

        return false;
    }
};

methods.isValidOfferType = function(type) {

    type = type.toLowerCase(type);
    if (type === 'buy' || type === 'sell') {

        return true;
    } else {

        return false;
    }
};

module.exports = methods;
