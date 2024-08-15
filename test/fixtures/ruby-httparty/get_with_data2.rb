require 'httparty'

url = 'http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id'
headers = {
  'X-Api-Key': '{admin_api_key}',
  'Content-Type': 'application/json',
}
res = HTTParty.put(url, headers: headers)
