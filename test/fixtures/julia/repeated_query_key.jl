using HTTP

query = [
    "key" => "one",
    "key" => "two"
]

resp = HTTP.get("http://localhost:28139", query=query)
