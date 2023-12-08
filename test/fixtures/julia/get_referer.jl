using HTTP

headers = Dict(
    "X-Requested-With" => "XMLHttpRequest",
    "User-Agent" => "SimCity",
    "Referer" => "https://website.com"
)

resp = HTTP.get("http://localhost:28139", headers)
