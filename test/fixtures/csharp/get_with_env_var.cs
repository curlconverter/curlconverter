using System;
using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/v2/images?type=distribution");

request.Headers.Add("Authorization", "Bearer " + Environment.GetEnvironmentVariable("DO_API_TOKEN"));

request.Content = new StringContent("");
request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
