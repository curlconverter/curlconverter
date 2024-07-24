import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812")
            .header("x-msisdn", "XXXXXXXXXXXXX")
            .header("user-agent", "Mozilla Android6.1")
            .asString();
    }
}
