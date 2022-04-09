request = %HTTPoison.Request{
  method: :put,
  url: "http://localhost:28139/upload",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: {:file, ~s|new_file|}
}

response = HTTPoison.request(request)
