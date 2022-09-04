import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/v2/images?type=distribution")
				.header("Authorization", "Bearer $DO_API_TOKEN")
				.header("Content-Type", "application/json")
				.method(Connection.Method.GET)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
