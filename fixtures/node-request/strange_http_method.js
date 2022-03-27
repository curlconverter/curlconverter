var request = require('request');

var options = {
    url: 'example.com',
    method: 'WHAT'
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);
