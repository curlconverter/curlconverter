import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139")
				.header("Content-Type", "application/x-www-form-urlencoded")
				.method(Connection.Method.POST)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
