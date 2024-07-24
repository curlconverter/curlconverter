import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.put("http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id")
            .header("X-Api-Key", "{admin_api_key}")
            .header("Content-Type", "application/json")
            .asString();
    }
}
