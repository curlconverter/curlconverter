HttpClientHandler handler = new HttpClientHandler();
handler.Proxy = new WebProxy("http://localhost:8080");

HttpClient client = new HttpClient(handler);

string responseBody = await client.GetStringAsync("http://localhost:28139");
