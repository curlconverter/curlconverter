import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/api/tunein/queue-and-play?deviceSerialNumber=xxx&deviceType=xxx&guideId=s56876&contentType=station&callSign=&mediaOwnerCustomerId=xxx"))
    .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
    .setHeader("Pragma", "no-cache")
    .setHeader("Access-Control-Request-Method", "POST")
    .setHeader("Origin", "https://alexa.amazon.de")
    .setHeader("Accept-Encoding", "gzip, deflate, br")
    .setHeader("Accept-Language", "de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4")
    .setHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
    .setHeader("Accept", "*/*")
    .setHeader("Cache-Control", "no-cache")
    .setHeader("Referer", "https://alexa.amazon.de/spa/index.html")
    .setHeader("Connection", "keep-alive")
    .setHeader("DNT", "1")
    .setHeader("Access-Control-Request-Headers", "content-type,csrf")
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
