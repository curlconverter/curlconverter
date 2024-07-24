import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.put("http://localhost:28139/upload")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .asString();
    }
}
