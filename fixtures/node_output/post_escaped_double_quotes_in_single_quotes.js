var request = require('request');

var dataString = 'foo=\"bar\"';

var options = {
    url: 'http://example.com/',
    method: 'POST',
    body: dataString
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);