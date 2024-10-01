import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.put("http://localhost:28139/twitter/_mapping/user?pretty")
            .header("Content-Type", "application/json")
            .body("{\"properties\": {\"email\": {\"type\": \"keyword\"}}}")
            .asString();
    }
}
