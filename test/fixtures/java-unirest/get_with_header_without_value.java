import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/get")
            .header("Content-Type", "text/xml;charset=UTF-8")
            .header("getWorkOrderCancel", "")
            .asString();
    }
}
