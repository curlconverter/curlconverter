import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/post")
            .field("d1","data1")
            .field("d2","data")
            .asString();
    }
}
