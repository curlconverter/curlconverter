import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4"))
    .GET()
    .setHeader("X-Api-Key", "123456789")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
