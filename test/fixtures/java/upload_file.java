import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.nio.file.Paths;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/file.txt"))
    .PUT(BodyPublishers.ofFile(Paths.get("file.txt")))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
