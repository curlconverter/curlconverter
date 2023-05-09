import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newBuilder()
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812"))
    .GET()
    .setHeader("x-msisdn", "XXXXXXXXXXXXX")
    .setHeader("user-agent", "Mozilla Android6.1")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
