$headers = @{
    "X-Api-Key" = "{admin_api_key}"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id" `
    -Method Put `
    -Headers $headers `
    -ContentType "application/json"
