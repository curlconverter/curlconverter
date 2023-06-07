import request from 'superagent';

request
  .post('http://localhost:28139')
  .type('form')
  .send('')
  .then(res => {
     console.log(res.body);
  });
