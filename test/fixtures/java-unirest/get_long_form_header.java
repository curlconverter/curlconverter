import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.get("http://localhost:28139/api/retail/books/list")
            .header("Accept", "application/json")
            .header("user-token", "75d7ce4350c7d6239347bf23d3a3e668")
            .asString();
    }
}
