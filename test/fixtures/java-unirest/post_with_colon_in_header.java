import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/endpoint")
            .header("Content-Type", "application/json")
            .header("key", "abcdefg")
            .asString();
    }
}
