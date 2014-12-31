'use strict';

var cookie = require('cookie');
var Getopt = require('node-getopt');
var stringArgv = require('string-argv');

var parseCurlCode_ = function(curlCommand) {


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


var toPython = function(curlCode) {

  var request = parseCurlCode_(curlCode);
  var cookieDict;
  if (request.cookies) {
    cookieDict = 'cookies = {\n';
    for (var cookieName in request.cookies) {
      cookieDict += "    '" + cookieName + "': '" + request.cookies[cookieName] + "',\n";
    }
    cookieDict += '}\n';
  }
  var headerDict;
  if (request.headers) {
    headerDict = 'headers = {\n';
    for (var headerName in request.headers) {
      headerDict += "    '" + headerName + "': '" + request.headers[headerName] + "',\n";
    }
    headerDict += '}\n';
  }

  var dataString;
  if (request.data) {
    dataString = 'data = \'' + request.data + '\'\n';
  }
  var requestLine = 'requests.' + request.method + '(\'' + request.url + '\'';
  if (request.headers) {
    requestLine += ', headers=headers';
  }
  if (request.cookies) {
    requestLine += ', cookies=cookies';
  }
  if (request.data) {
    requestLine += ', data=data';
  }
  requestLine += ')';

  var pythonCode = '';
  if (cookieDict) {
    pythonCode += cookieDict + '\n';
  }
  if (headerDict) {
    pythonCode += headerDict + '\n';
  }
  if (dataString) {
    pythonCode += dataString + '\n';
  }
  pythonCode += requestLine;

  return pythonCode;
};


var toNode = function() {
  return 'TODO: write this function';
};


module.exports = {
  toPython: toPython,
  toNode: toNode
};