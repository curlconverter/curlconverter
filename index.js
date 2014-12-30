'use strict';

var cookie = require('cookie');
var Getopt = require('node-getopt');
var stringArgv = require('string-argv');

var parseCurlCode_ = function(curlCommand) {


  var args = stringArgv.parseArgsStringToArgv(curlCommand);
  var getopt = new Getopt([
    ['H', 'header=ARG+', 'http header'],
    ['', 'compressed', 'long'],
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
  var method = getopt.options.method === 'POST' ? 'post' : 'get';
  var request = {
    url: url,
    headers: headers,
    cookies: cookies,
    method: method
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

  var requestLine = 'requests.' + request.method + '(\'' + request.url + '\', headers=headers, cookies=cookies)';
  var pythonCode = cookieDict + '\n' + headerDict + '\n' + requestLine;

  return pythonCode;
};


var toNode = function() {
  return 'TODO: write this function';
};


module.exports = {
  toPython: toPython,
  toNode: toNode
};