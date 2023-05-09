import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/api/servers/00000000000/shared_servers/"))
    .POST(BodyPublishers.ofString("$MYVARIABLE"))
    .setHeader("'Accept'", "'application/json'")
    .setHeader("Authorization", "Bearer 000000000000000-0000")
    .setHeader("Content-Type", "application/json")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
