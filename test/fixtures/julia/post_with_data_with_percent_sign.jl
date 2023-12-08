using HTTP

headers = Dict(
    "Content-Type" => "application/x-www-form-urlencoded"
)

body = "secret=*%5*!"

resp = HTTP.post("http://localhost:28139/post", headers, body)
