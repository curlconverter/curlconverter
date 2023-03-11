import got from 'got';

const response = await got.put('http://localhost:28139/v2/alerts_policy_channels.json', {
  searchParams: {
    'policy_id': 'policy_id',
    'channel_ids': 'channel_id'
  },
  headers: {
    'X-Api-Key': '{admin_api_key}',
    'Content-Type': 'application/json'
  }
});
