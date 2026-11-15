using HTTP

form = HTTP.Form(
    Dict(
        "name" => "value"
    )
)

resp = HTTP.post("http://localhost:28139/upload", [], form)
