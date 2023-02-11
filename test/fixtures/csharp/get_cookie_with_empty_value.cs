using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/cookies");

request.Headers.Add("accept", "application/json");
request.Headers.Add("Cookie", "mysamplecookie=someValue; emptycookie=; otherCookie=2");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
