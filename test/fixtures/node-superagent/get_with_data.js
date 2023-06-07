import request from 'superagent';

request
  .get('http://localhost:28139/synthetics/api/v3/monitors')
  .query({
    'test': '2',
    'limit': '100',
    'w': '4'
  })
  .set('X-Api-Key', '123456789')
  .then(res => {
     console.log(res.body);
  });
