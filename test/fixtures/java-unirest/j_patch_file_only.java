import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) throws FileNotFoundException {
            HttpResponse<String> httpResponse
               = Unirest.patch("http://localhost:28139/patch")
            .field("file1", new FileInputStream(new File("./test/fixtures/curl_commands/delete.sh")), "./test/fixtures/curl_commands/delete.sh")
            .asString();
    }
}
