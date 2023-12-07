using HTTP

headers = Dict(
    "Content-Type" => "application/json",
    "Accept" => "application/json"
)

body = "18233982904"

resp = HTTP.post(
    "http://localhost:28139/CurlToNode",
    headers,
    body
)
