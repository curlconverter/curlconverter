import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/rest/login-sessions")
			.header("Content-Type", "application/json")
			.header("X-API-Version", "200")
			.requestBody("{\"userName\":\"username123\",\"password\":\"password123\", \"authLoginDomain\":\"local\"}")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
