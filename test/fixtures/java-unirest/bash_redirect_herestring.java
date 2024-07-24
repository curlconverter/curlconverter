import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/servers/00000000000/shared_servers/")
            .header("'Accept'", "'application/json'")
            .header("Authorization", "Bearer 000000000000000-0000")
            .header("Content-Type", "application/json")
            .asString();
    }
}
