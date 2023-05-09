import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.util.Base64;

HttpClient client = HttpClient.newHttpClient();

String credentials = "username" + ":" + "password";
String auth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da"))
    .method("PATCH", BodyPublishers.ofString("{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }"))
    .setHeader("Accept", "application/vnd.go.cd.v4+json")
    .setHeader("Content-Type", "application/json")
    .setHeader("Authorization", auth)
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
