'use strict';

var parseCurlCode_ = function(curlCode) {
  // todo: figure out if requests can automatically gzip content
  curlCode = curlCode.replace(' --compressed', '');
  var tokens = curlCode.split(' -H ');
  var url = tokens[0].replace('curl ', '').substring(1, tokens[0].length - 1);
  var isPostRequest = false;
  if (url.indexOf('-X POST') !== -1) {
    isPostRequest = true;
    url = url.replace(' -X POST', '');
  }
  tokens.shift();
  var headers = {};
  var cookies = {};
  tokens.forEach(function(header, i) {
    if (!header.indexOf(':')) {
      return;
    }
    //remove first and last single quote
    header = header.substring(1, header.length - 1);
    var colonIndex = header.indexOf(':');
    var headerName = header.substring(0, colonIndex);
    var headerValue = header.substring(colonIndex + 2);
    if (headerName === 'Cookie') {
      // todo extract this to a real cookie string parser
      var cookieStrings = headerValue.split('; ');
      cookieStrings.forEach(function(cookie, i) {
        var pair = cookieStrings[i].split('=');
        cookies[pair[0]] = pair[1];
      });
    } else {
      headers[headerName] = headerValue;
    }
  });

  var request = {
    url: url,
    headers: headers,
    cookies: cookies,
    method: isPostRequest ? 'post' : 'get'
  };
  return request;
};


var toPython = function(curlCode) {

  var request = parseCurlCode_(curlCode);
  var cookieDict = 'cookies = {\n';
  for (var cookieName in request.cookies) {
    cookieDict += "    '" + cookieName + "': '" + request.cookies[cookieName] + "',\n";
  }
  cookieDict += '}\n';

  var headerDict = 'headers = {\n';
  for (var headerName in request.headers) {
    headerDict += "    '" + headerName + "': '" + request.headers[headerName] + "',\n";
  }
  headerDict += '}\n';

  var requestLine = 'requests.' + request.method + '(\'' + request.url + ', headers=headers, cookies=cookies)';
  var pythonCode = cookieDict + '\n' + headerDict + '\n' + requestLine;

  return pythonCode;
};


var toNode = function(request) {
  return 'TODO: write this function';
};


module.exports = {
  toPython: toPython,
  toNode: toNode
};