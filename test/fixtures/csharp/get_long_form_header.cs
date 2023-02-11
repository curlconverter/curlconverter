using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/api/retail/books/list");

request.Headers.Add("Accept", "application/json");
request.Headers.Add("user-token", "75d7ce4350c7d6239347bf23d3a3e668");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
