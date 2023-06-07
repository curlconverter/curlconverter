import request from 'superagent';

request
  .get('http://localhost:28139')
  .redirects('20')
  .then(res => {
     console.log(res.body);
  });
