import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139")
            .header("sec-ch-ua", "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"92\"")
            .asString();
    }
}
