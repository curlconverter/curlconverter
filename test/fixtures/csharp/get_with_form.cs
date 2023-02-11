using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/v3");

request.Headers.Add("Authorization", "Basic " + Convert.ToBase64String(System.Text.ASCIIEncoding.ASCII.GetBytes("test:")));


MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new StringContent("test@tester.com"), "from");
content.Add(new StringContent("devs@tester.net"), "to");
content.Add(new StringContent("Hello"), "subject");
content.Add(new StringContent("Testing the converter!"), "text");
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
