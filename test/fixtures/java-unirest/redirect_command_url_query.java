import java.lang.Runtime;
import java.util.Scanner;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139?@" + exec("echo image.jpg"))
            .asString();
    }
}
