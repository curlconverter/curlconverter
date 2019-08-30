var request = require('request');

var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

var dataString = '18233982904';

var options = {
    url: 'http://198.30.191.00:8309/CurlToNode',
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
