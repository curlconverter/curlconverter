using HTTP

query = [
    "policy_id" => "policy_id",
    "channel_ids" => "channel_id"
]

headers = Dict(
    "X-Api-Key" => "{admin_api_key}",
    "Content-Type" => "application/json"
)

resp = HTTP.put(
    "http://localhost:28139/v2/alerts_policy_channels.json",
    headers,
    query=query
)
