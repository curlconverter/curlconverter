using Base64, HTTP

headers = Dict(
    "Authorization" => "Basic " * base64encode("some_username:some_password")
)

resp = HTTP.get("http://localhost:28139/", headers)
