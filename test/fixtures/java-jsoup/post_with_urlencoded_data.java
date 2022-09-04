import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/echo/html/")
				.header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
				.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
				.method(Connection.Method.POST)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
