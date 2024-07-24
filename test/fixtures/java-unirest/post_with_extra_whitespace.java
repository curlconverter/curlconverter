import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) throws FileNotFoundException {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/library")
            .header("accept", "application/json")
            .header("Content-Type", "multipart/form-data")
            .field("files", new FileInputStream(new File("47.htz")), "47.htz")
            .field("name","47")
            .field("oldMediaId","47")
            .field("updateInLayouts","1")
            .field("deleteOldRevisions","1")
            .asString();
    }
}
