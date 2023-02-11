using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Patch, "http://localhost:28139/patch");

MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new ByteArrayContent(File.ReadAllBytes("./test/fixtures/curl_commands/delete.sh")), "file1", Path.GetFileName("./test/fixtures/curl_commands/delete.sh"));
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
