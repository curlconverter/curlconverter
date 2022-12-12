var request = require('request');

var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

var dataString = "foo='bar'";

var options = {
    url: 'http://localhost:28139/',
    method: 'POST',
    headers: headers,
    body: dataString
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);
