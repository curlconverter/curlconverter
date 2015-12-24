var cookie = require('cookie');
var stringArgv = require('string-argv');
var parseArgs = require('minimist');

var parseCurlCommand = function(curlCommand) {
    var argumentArray = stringArgv.parseArgsStringToArgv(curlCommand);
    var parsedArguments = parseArgs(argumentArray);

    // minimist fails to parse double quoted json properly
    // hack around that
    if (parsedArguments['data-binary']) {
        var re = /--data-binary '([{}A-z0-9"\s:]+)'/;
        var groups = re.exec(curlCommand);
        if (groups) {
            parsedArguments['data-binary'] = groups[1];
        }
    }

    var cookieString;
    var cookies;
    var url = parsedArguments._[1];
    var headers;
    if (parsedArguments.H) {
        headers = {};
        parsedArguments.H.forEach(function (header) {
            if (header.indexOf('Cookie') !== -1) {
                cookieString = header;
            } else {
                var colonIndex = header.indexOf(':');
                var headerName = header.substring(0, colonIndex);
                var headerValue = header.substring(colonIndex + 1).trim();
                headers[headerName] = headerValue;
            }
        });
    }
    if (cookieString) {
        var cookieParseOptions = {
            decode: function(s) {return s;}
        };
        cookies = cookie.parse(cookieString.replace('Cookie: ', ''), cookieParseOptions);
    }
    var method;
    if (parsedArguments.X === 'POST') {
        method = 'post';
    } else if (parsedArguments.data || parsedArguments['data-binary']) {
        method = 'post';
    } else {
        method = 'get';
    }
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
    } else if (parsedArguments['data-binary']) {
        request.data = parsedArguments['data-binary'];
    }
    return request;
};

module.exports = {
    parseCurlCommand: parseCurlCommand
};
