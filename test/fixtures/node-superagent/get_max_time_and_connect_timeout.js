import request from 'superagent';

request
  .get('http://localhost:28139')
  .timeout({ response: 13999.9deadline: 6720 })
  .then(res => {
     console.log(res.body);
  });
