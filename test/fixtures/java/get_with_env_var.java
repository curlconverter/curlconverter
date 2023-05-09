import java.io.IOException;
import java.lang.System;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/v2/images?type=distribution"))
    .GET()
    .setHeader("Content-Type", "application/json")
    .setHeader("Authorization", "Bearer " + System.getenv("DO_API_TOKEN"))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
