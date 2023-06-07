import request from 'superagent';

request
  .get('http://localhost:28139/echo/html/')
  .set('Origin', 'http://fiddle.jshell.net')
  .type('form')
  .send({
    'msg1': 'value1',
    'msg2': 'value2'
  })
  .then(res => {
     console.log(res.body);
  });
