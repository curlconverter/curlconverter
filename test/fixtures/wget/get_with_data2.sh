wget --method=PUT \
  --header="X-Api-Key: {admin_api_key}" \
  --header="Content-Type: application/json" \
  --output-document - \
  "http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id"
