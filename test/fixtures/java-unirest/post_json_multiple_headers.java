import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/rest/login-sessions")
            .header("Content-Type", "application/json")
            .header("X-API-Version", "200")
            .body("{\"userName\":\"username123\",\"password\":\"password123\", \"authLoginDomain\":\"local\"}")
            .asString();
    }
}
