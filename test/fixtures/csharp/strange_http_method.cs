using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(new HttpMethod("wHat"), "http://localhost:28139");
HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
