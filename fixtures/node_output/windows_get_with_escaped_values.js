var request = require('request');

var dataString = 'a=b&c=d&e=f&h=i&j=k&l=m';

var options = {
    url: 'http://www.url.com/page',
    method: 'POST',
    body: dataString
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);