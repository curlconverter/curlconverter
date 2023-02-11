using System.Net.Http;
using System.Net.Http.Headers;

HttpClient client = new HttpClient();

HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:28139/api/library");

request.Headers.Add("accept", "application/json");


MultipartFormDataContent content = new MultipartFormDataContent();
content.Add(new ByteArrayContent(File.ReadAllBytes("47.htz")), "files", Path.GetFileName("47.htz"));
content.Add(new StringContent("47"), "name");
content.Add(new StringContent("47"), "oldMediaId");
content.Add(new StringContent("1"), "updateInLayouts");
content.Add(new StringContent("1"), "deleteOldRevisions");
request.Content = content;
request.Content.Headers.ContentType = new MediaTypeHeaderValue("multipart/form-data");

HttpResponseMessage response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
string responseBody = await response.Content.ReadAsStringAsync();
