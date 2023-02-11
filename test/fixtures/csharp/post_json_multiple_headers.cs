using System.Net.Http;
using System.Net.Http.Headers;

HttpClientHandler handler = new HttpClientHandler();
handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;

HttpClient client = new HttpClient(handler);

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/rest/login-sessions");

request.Headers.Add("X-API-Version", "200");

request.Content = new StringContent("{\"userName\":\"username123\",\"password\":\"password123\", \"authLoginDomain\":\"local\"}");
request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
