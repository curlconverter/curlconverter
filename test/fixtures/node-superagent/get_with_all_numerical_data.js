import request from 'superagent';

request
  .post('http://localhost:28139/CurlToNode')
  .set('Accept', 'application/json')
  .type('json')
  .send('18233982904')
  .then(res => {
     console.log(res.body);
  });
