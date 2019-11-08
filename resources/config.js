var configuration = {

    development: {
        app: {

            name: 'GetCoins',
        }, server: {

            url: 'http://localhost:8585/',
            port: 8585,
        }, database: {

            url: 'mongodb://localhost/getcoins'
        }, mail: {

            email: 'testpariharrohit@gmail.com',
            password: 'Test@123',
            service: 'gmail',
            feedbackemail: 'devpariharrohit2015@gmail.com',
        }, firebase: {

            jsonfile: 'rpgetcoins-firebase-adminsdk-t8deh-2b50c1acc1.json',
            database: 'https://rpgetcoins.firebaseio.com/'
        }, twilio: {

            accountsid: 'AC7879468723ea7929b2ba5b974333a384',
            authtoken: 'c8d02b56ad378df949ef3c2e2133e640',
            twilionumber: '+18564062646'
        }, blockchain: {

            api_code: 'dcf12df4-bb29-4215-8745-0af04cb0dade',
        }, defaults: {

            nearestuserdistance: '5',
        }
    },
    production: {
        app: {

            name: 'GetCoins',
        }, server: {

            url: 'https://getcoins.herokuapp.com/',
            port: 8080,
        }, database: {

            url: 'mongodb://parihar:parihar@getcoins-shard-00-00-ags2s.mongodb.net:27017,getcoins-shard-00-01-ags2s.mongodb.net:27017,getcoins-shard-00-02-ags2s.mongodb.net:27017/test?ssl=true&replicaSet=getcoins-shard-0&authSource=admin'
        }, mail: {

            email: 'testpariharrohit@gmail.com',
            password: 'Test@123',
            service: 'gmail',
            feedbackemail: 'devpariharrohit2015@gmail.com',
        }, firebase: {

            jsonfile: 'rpgetcoins-firebase-adminsdk-t8deh-2b50c1acc1.json',
            database: 'https://rpgetcoins.firebaseio.com/'
        }, twilio: {

            accountsid: 'AC7879468723ea7929b2ba5b974333a384',
            authtoken: 'c8d02b56ad378df949ef3c2e2133e640',
            twilionumber: '+18564062646'
        }, blockchain: {

            api_code: 'dcf12df4-bb29-4215-8745-0af04cb0dade',
        }, defaults: {

            nearestuserdistance: '5',
        }
    }
};

module.exports = configuration[process.env.NODE_ENV] || configuration.development;
