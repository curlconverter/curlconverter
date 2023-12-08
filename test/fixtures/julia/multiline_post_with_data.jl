using HTTP

headers = Dict(
    "Origin" => "http://fiddle.jshell.net",
    "Content-Type" => "application/x-www-form-urlencoded"
)

body = Dict(
    "msg1" => "value1",
    "msg2" => "value2"
)

resp = HTTP.get("http://localhost:28139/echo/html/", headers, body)
