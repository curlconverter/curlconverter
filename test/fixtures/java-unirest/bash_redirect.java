import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/2.0/fo/auth/unix/?action=create&title=UnixRecord&username=root&password=abc123&ips=10.10.10.10")
            .basicAuth("USER", "PASS")
            .header("X-Requested-With", "curl")
            .header("Content-Type", "text/xml")
            .asString();
    }
}
