import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/webservices/rest.php")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ \"operation\": \"core/get\", \"class\": \"Software\", \"key\": \"key\" }")
            .asString();
    }
}
