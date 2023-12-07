using HTTP

query = [
    "test" => "2",
    "limit" => "100",
    "w" => "4"
]

headers = Dict(
    "X-Api-Key" => "123456789"
)

resp = HTTP.get(
    "http://localhost:28139/synthetics/api/v3/monitors",
    headers,
    query=query,
    verbose=1
)
