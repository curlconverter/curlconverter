using Base64, HTTP

headers = Dict(
    "Authorization" => "Basic " * base64encode("test:")
)

form = HTTP.Form(
    Dict(
        "from" => "test@tester.com",
        "to" => "devs@tester.net",
        "subject" => "Hello",
        "text" => "Testing the converter!"
    )
)

resp = HTTP.post("http://localhost:28139/v3", headers, form)
