request = %HTTPoison.Request{
  method: :put,
  url: "http://awesomeurl.com/upload",
  options: [],
  headers: [],
  params: [],
  body: {:file, ~s|new_file|}
}

response = HTTPoison.request(request)
