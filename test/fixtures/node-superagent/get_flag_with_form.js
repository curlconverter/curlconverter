import request from 'superagent';

request
  .post('http://localhost:28139/upload')
  .field('name', 'value')
  .then(res => {
     console.log(res.body);
  });
