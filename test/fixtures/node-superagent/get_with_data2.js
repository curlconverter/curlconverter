import request from 'superagent';

request
  .put('http://localhost:28139/v2/alerts_policy_channels.json')
  .query({
    'policy_id': 'policy_id',
    'channel_ids': 'channel_id'
  })
  .set('X-Api-Key', '{admin_api_key}')
  .type('json')
  .then(res => {
     console.log(res.body);
  });
