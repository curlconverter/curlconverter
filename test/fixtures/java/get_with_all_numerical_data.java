import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/CurlToNode"))
    .POST(BodyPublishers.ofString("18233982904"))
    .setHeader("Content-Type", "application/json")
    .setHeader("Accept", "application/json")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
