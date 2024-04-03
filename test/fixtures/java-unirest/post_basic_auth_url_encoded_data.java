import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/oauth/token/")
            .basicAuth("foo", "bar")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .field("grant_type","client_credentials")
            .asString();
    }
}
