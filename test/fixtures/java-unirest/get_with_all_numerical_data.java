import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/CurlToNode")
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .body("18233982904")
            .asString();
    }
}
