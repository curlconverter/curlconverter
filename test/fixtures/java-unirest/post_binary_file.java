import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/american-art/query")
            .header("Content-type", "application/sparql-query")
            .header("Accept", "application/sparql-results+json")
            .asString();
    }
}
