using HTTP

headers = Dict(
    "Authorization" => "Bearer ACCESS_TOKEN"
)

form = HTTP.Form(
    Dict(
        "attributes" => "{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}",
        "file" => open("myfile.jpg")
    )
)

resp = HTTP.post("http://localhost:28139/api/2.0/files/content", headers, form)
