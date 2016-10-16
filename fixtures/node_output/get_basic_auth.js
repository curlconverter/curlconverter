var request = require('request');

var options = {
    url: 'https://api.test.com/',
    auth: {
        'user': 'some_username',
        'pass': 'some_password'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);