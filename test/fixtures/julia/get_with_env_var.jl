using HTTP

query = [
    "type" => "distribution"
]

headers = Dict(
    "Content-Type" => "application/json",
    "Authorization" => "Bearer " * ENV["DO_API_TOKEN"]
)

resp = HTTP.get("http://localhost:28139/v2/images", headers, query=query)
