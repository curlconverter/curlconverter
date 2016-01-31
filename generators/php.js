var util = require('../util');
var querystring = require('querystring');

var toPython = function(curlCommand) {

    var request = util.parseCurlCommand(curlCommand);

    var headerDict;
    if (request.headers) {
        headerDict = '$headers = array(\n';
        var i = 0;
        var headerCount = Object.keys(request.headers).length;
        for (var headerName in request.headers) {
            headerDict += "    '" + headerName + "' => '" + request.headers[headerName] + "'";
            if (i < headerCount - 1) {
                headerDict +=  ",\n";
            }
            i++;
        }
        headerDict += '\n);';
    }

    var dataString;
    if (request.data) {
        var parsedQueryString = querystring.parse(request.data);
        dataString = '$data = array(\n';
        var dataCount = Object.keys(parsedQueryString).length;
        var i = 0;
        for (var key in parsedQueryString) {
            var value = parsedQueryString[key];
            dataString += "    '" + key + "' => '" + value + "'";
            if (i < dataCount - 1) {
                dataString += ",\n";
            }
            i++;
        }
        dataString += "\n);"
    }
    var requestLine = '$response = Requests::' + request.method + '(\'' + request.url + '\'';
    requestLine += ', $headers';
    requestLine += ', $data';
    requestLine += ');';

    var phpCode = '<?php\n';
    phpCode += 'include(\'vendor/rmccue/requests/library/Requests.php\');\n';
    phpCode += 'Requests::register_autoloader();\n';
    if (headerDict) {
        phpCode += headerDict + '\n';
    }
    if (dataString) {
        phpCode += dataString + '\n';
    }
    phpCode += requestLine;

    return phpCode;
};

module.exports = toPython;