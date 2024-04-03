import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/cookies")
            .header("accept", "application/json")
            .header("Cookie", "mysamplecookie=someValue; emptycookie=; otherCookie=2")
            .asString();
    }
}
