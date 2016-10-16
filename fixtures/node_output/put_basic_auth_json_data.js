var request = require('request');

var dataString = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}';

var options = {
    url: 'http://localhost:5984/test/_security',
    method: 'PUT',
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