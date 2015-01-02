var cookie = require('cookie');
var Getopt = require('node-getopt');
var stringArgv = require('string-argv');

var parseCurlCommand = function(curlCommand) {
    var args = stringArgv.parseArgsStringToArgv(curlCommand);
    var getopt = new Getopt([
        ['H', 'header=ARG+', 'http header'],
        ['', 'compressed', 'long'],
        ['', 'data=ARG', 'request payload'],
        ['X', 'method=ARG', 'request command']
    ]).parse(args); // parse command line

    var cookieString;
    var cookies;
    var url = getopt.argv[1];
    var headers = {};
    getopt.options.header.forEach(function(header) {
        if (header.indexOf('Cookie') !== -1) {
            cookieString = header;
        } else {
            var colonIndex = header.indexOf(':');
            var headerName = header.substring(0, colonIndex);
            var headerValue = header.substring(colonIndex + 2);
            headers[headerName] = headerValue;
        }
    });
    if (cookieString) {
        var cookieParseOptions = {
            decode: function(s) {return s;}
        };
        cookies = cookie.parse(cookieString.replace('Cookie: ', ''), cookieParseOptions);
    }
    var method = getopt.options.method === 'POST' || getopt.options.data ? 'post' : 'get';
    var request = {
        url: url,
        headers: headers,
        cookies: cookies,
        method: method,
        data: getopt.options.data
    };
    return request;
};

module.exports = {
    parseCurlCommand: parseCurlCommand
};