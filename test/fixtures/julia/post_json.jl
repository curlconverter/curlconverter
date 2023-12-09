using HTTP, JSON

headers = Dict(
    "Content-Type" => "application/json",
    "Accept" => "application/json"
)

body = Dict(
    "drink" => "coffe"
)

resp = HTTP.post("http://localhost:28139", headers, JSON.json(body))
