import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
        Unirest.config()
            .proxy("localhost", 8080);
        HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139")
            .asString();
    }
}
