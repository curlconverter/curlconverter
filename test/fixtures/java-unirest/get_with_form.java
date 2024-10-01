import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/v3")
            .basicAuth("test", "")
            .field("from","test@tester.com")
            .field("to","devs@tester.net")
            .field("subject","Hello")
            .field("text","Testing the converter!")
            .asString();
    }
}
