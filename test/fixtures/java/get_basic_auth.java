import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

HttpClient client = HttpClient.newHttpClient();

String credentials = "some_username" + ":" + "some_password";
String auth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/"))
    .GET()
    .setHeader("Authorization", auth)
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
