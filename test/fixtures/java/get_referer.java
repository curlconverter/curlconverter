import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139"))
    .GET()
    .setHeader("X-Requested-With", "XMLHttpRequest")
    .setHeader("User-Agent", "SimCity")
    .setHeader("Referer", "https://website.com")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
