import request from 'superagent';

request
  .post('http://localhost:28139/post')
  .type('form')
  .send('secret=*%5*!')
  .then(res => {
     console.log(res.body);
  });
