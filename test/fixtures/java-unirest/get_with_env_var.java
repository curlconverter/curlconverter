import java.lang.System;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/v2/images?type=distribution")
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + System.getenv("DO_API_TOKEN"))
            .asString();
    }
}
