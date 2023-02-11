using System.Net.Http;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Patch, "http://localhost:28139/patch");

MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new ByteArrayContent(File.ReadAllBytes("./test/fixtures/curl_commands/delete.sh")), "file1", Path.GetFileName("./test/fixtures/curl_commands/delete.sh"));
content.Add(new StringContent("form+data+1"), "form1");
content.Add(new StringContent("form_data_2"), "form2");
request.Content = content;

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
