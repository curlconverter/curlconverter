using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/");

request.Headers.Add("Authorization", "Basic " + Convert.ToBase64String(System.Text.ASCIIEncoding.ASCII.GetBytes("some_username:some_password")));

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
