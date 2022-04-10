var request = require('request');

var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

var dataString = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}';

var options = {
    url: 'http://localhost:28139/test/_security',
    method: 'PUT',
    headers: headers,
    body: dataString,
    auth: {
        'user': 'admin',
        'pass': '123'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);
