import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.put("http://localhost:28139/test/_security")
            .basicAuth("admin", "123")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}")
            .asString();
    }
}
