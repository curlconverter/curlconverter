import request from 'superagent';

request
  .post('http://localhost:28139/api/xxxxxxxxxxxxxxxx')
  .type('form')
  .send('{"keywords":"php","page":1,"searchMode":1}')
  .then(res => {
     console.log(res.body);
  });
