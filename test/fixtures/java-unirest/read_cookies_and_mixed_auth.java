import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139")
            .basicAuth("user", "pass")
            .header("Authorization", "Bearer AAAAAAAAAAAA")
            .asString();
    }
}
