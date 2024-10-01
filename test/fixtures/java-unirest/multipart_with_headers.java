import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) throws FileNotFoundException {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/2.0/files/content")
            .header("Authorization", "Bearer ACCESS_TOKEN")
            .header("X-Nice", "Header")
            .field("attributes","{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}")
            .field("file", new FileInputStream(new File("myfile.jpg")), "myfile.jpg")
            .asString();
    }
}
