import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4")
            .header("X-Api-Key", "123456789")
            .asString();
    }
}
