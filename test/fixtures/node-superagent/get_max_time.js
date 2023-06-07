import request from 'superagent';

request
  .get('http://localhost:28139')
  .timeout(20000)
  .then(res => {
     console.log(res.body);
  });
