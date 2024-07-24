import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.patch("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da")
            .basicAuth("username", "password")
            .header("Accept", "application/vnd.go.cd.v4+json")
            .header("Content-Type", "application/json")
            .body("{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }")
            .asString();
    }
}
