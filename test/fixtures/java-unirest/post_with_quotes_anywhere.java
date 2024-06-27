import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139")
            .basicAuth("ol'", "asd\"")
            .header("A", "''a'")
            .header("B", "\"")
            .header("Cookie", "x=1'; y=2\"")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("a=b&c=\"&d='")
            .asString();
    }
}
