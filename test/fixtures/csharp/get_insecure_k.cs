HttpClientHandler handler = new HttpClientHandler();
handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;

HttpClient client = new HttpClient(handler);

string responseBody = await client.GetStringAsync("http://localhost:28139");
