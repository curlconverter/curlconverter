import got from 'got';

const response = await got('http://localhost:28139/echo/html/', {
  headers: {
    'Origin': 'http://fiddle.jshell.net'
  },
  form: {
    'msg1': 'value1',
    'msg2': 'value2'
  },
  allowGetBody: true
});
