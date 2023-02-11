using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Put, "http://localhost:28139/file.txt");
request.Content = new ByteArrayContent(File.ReadAllBytes("file.txt"));

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
