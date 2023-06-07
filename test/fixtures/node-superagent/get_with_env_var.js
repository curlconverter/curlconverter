import request from 'superagent';

request
  .get('http://localhost:28139/v2/images')
  .query({
    'type': 'distribution'
  })
  .set('Authorization', 'Bearer ' + process.env['DO_API_TOKEN'])
  .type('json')
  .then(res => {
     console.log(res.body);
  });
