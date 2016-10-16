var request = require('request');

var headers = {
    'foo': 'bar'
};

var options = {
    url: 'http://example.com/',
    headers: headers
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);