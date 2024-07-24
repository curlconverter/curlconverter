import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) throws FileNotFoundException {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/targetservice")
            .field("image", new FileInputStream(new File("image.jpg")), "image.jpg")
            .asString();
    }
}
