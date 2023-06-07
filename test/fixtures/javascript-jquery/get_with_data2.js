$.ajax({
  url: 'http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id',
  crossDomain: true,
  method: 'put',
  headers: {
    'X-Api-Key': '{admin_api_key}'
  },
  contentType: 'application/json'
}).done(function(response) {
  console.log(response);
});
