import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/webservices/rest.php")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.requestBody("version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ \"operation\": \"core/get\", \"class\": \"Software\", \"key\": \"key\" }")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
