var request = require('request');

var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env['DO_API_TOKEN']
};

var options = {
    url: 'http://localhost:28139/v2/images?type=distribution',
    headers: headers
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);
