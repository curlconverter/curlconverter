import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id"))
    .PUT(HttpRequest.BodyPublishers.noBody())
    .setHeader("X-Api-Key", "{admin_api_key}")
    .setHeader("Content-Type", "application/json")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
