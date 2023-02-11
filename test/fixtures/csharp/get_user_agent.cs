using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812");

request.Headers.Add("x-msisdn", "XXXXXXXXXXXXX");
request.Headers.Add("user-agent", "Mozilla Android6.1");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
