import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.patch("http://localhost:28139/patch")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("item[]=1&item[]=2&item[]=3")
            .asString();
    }
}
