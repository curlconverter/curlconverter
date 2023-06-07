import request from 'superagent';

request
  .post('http://localhost:28139')
  .set('Accept', 'application/json')
  .type('json')
  //  .send('{   }')
  .send({})
  .then(res => {
     console.log(res.body);
  });
