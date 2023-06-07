import http from 'http';

const options = {
  hostname: 'localhost:28139',
  path: '/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id',
  method: 'PUT',
  headers: {
    'X-Api-Key': '{admin_api_key}',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});
req.end();
