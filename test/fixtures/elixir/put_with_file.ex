request = %HTTPoison.Request{
  method: :put,
  url: "http://awesomeurl.com/upload",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: {:file, ~s|new_file|}
}

response = HTTPoison.request(request)
