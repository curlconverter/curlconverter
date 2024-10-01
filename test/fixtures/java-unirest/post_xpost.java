import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/xxxxxxxxxxxxxxxx")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("{\"keywords\":\"php\",\"page\":1,\"searchMode\":1}")
            .asString();
    }
}
