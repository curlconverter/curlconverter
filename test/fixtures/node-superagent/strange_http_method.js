import request from 'superagent';

request('wHat', 'http://localhost:28139')
  .then(res => {
     console.log(res.body);
  });
