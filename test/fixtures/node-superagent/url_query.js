import request from 'superagent';

request
  .get('http://localhost:28139')
  .query({
    'foo': 'bar',
    'baz': 'qux'
  })
  .then(res => {
     console.log(res.body);
  });
