var request = require('request');

var dataString = 'msg1=wow&msg2=such&msg3=@rawmsg';

var options = {
    url: 'http://example.com/post',
    method: 'POST',
    body: dataString
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);
