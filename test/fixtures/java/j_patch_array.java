import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/patch"))
    .method("PATCH", BodyPublishers.ofString("item[]=1&item[]=2&item[]=3"))
    .setHeader("Content-Type", "application/x-www-form-urlencoded")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
