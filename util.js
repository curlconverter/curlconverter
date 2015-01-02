var cookie = require('cookie');
var stringArgv = require('string-argv');
var parseArgs = require('minimist');

var parseCurlCommand = function(curlCommand) {
    var argumentArray = stringArgv.parseArgsStringToArgv(curlCommand);
    var parsedArguments = parseArgs(argumentArray);

    var cookieString;
    var cookies;
    var url = parsedArguments._[1];
    var headers = {};
    parsedArguments.H.forEach(function(header) {
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
    var method = parsedArguments.X === 'POST' || parsedArguments.data ? 'post' : 'get';
    var request = {
        url: url,
        method: method
    };
    if (headers) {
        request.headers = headers;
    }
    if (cookies) {
        request.cookies = cookies;
    }
    if (parsedArguments.data) {
        request.data = parsedArguments.data;
    }
    return request;
};

module.exports = {
    parseCurlCommand: parseCurlCommand
};