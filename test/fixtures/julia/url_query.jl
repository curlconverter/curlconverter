using HTTP

query = [
    "foo" => "bar",
    "baz" => "qux"
]

resp = HTTP.get("http://localhost:28139", query=query)
