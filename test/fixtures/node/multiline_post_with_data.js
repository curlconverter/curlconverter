import fetch from 'node-fetch';

fetch('http://localhost:28139/echo/html/', {
  headers: {
    'Origin': 'http://fiddle.jshell.net'
  },
  body: new URLSearchParams({
    'msg1': 'value1',
    'msg2': 'value2'
  })
});
