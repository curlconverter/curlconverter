using HTTP

headers = Dict(
    "Content-Type" => "application/json",
    "Accept" => "application/json"
)

body = "{   }"

resp = HTTP.post(
    "http://localhost:28139",
    headers,
    body
)
