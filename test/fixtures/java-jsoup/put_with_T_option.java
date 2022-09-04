import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/twitter/_mapping/user?pretty")
				.header("Content-Type", "application/json")
				.requestBody("{\"properties\": {\"email\": {\"type\": \"keyword\"}}}")
				.method(Connection.Method.PUT)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
