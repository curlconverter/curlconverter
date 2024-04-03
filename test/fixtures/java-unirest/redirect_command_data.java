import java.lang.Runtime;
import java.util.Scanner;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("foo&@" + exec("echo myfile.jg"))
            .asString();
    }
}
