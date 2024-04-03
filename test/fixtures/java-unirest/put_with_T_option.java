import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) throws FileNotFoundException {
            HttpResponse<String> httpResponse
               = Unirest.put("http://localhost:28139/twitter/_mapping/user?pretty")
            .header("Content-Type", "application/json")
            .body(new FileInputStream(new File("my_file.txt")))
            .asString();
    }
}
