HttpClient client = new HttpClient();

HttpResponseMessage response = await client.DeleteAsync("http://localhost:28139/page");
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
