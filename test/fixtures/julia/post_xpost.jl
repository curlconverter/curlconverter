using HTTP

headers = Dict(
    "Content-Type" => "application/x-www-form-urlencoded"
)

body = "{\"keywords\":\"php\",\"page\":1,\"searchMode\":1}"

resp = HTTP.post("http://localhost:28139/api/xxxxxxxxxxxxxxxx", headers, body)
