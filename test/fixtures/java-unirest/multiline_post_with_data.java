import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/echo/html/")
            .header("Origin", "http://fiddle.jshell.net")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .field("msg1","value1")
            .field("msg2","value2")
            .asString();
    }
}
