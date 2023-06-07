import request from 'superagent';

request
  .get('http://localhost:28139')
  .query({
    'key': ['one', 'two']
  })
  .then(res => {
     console.log(res.body);
  });
