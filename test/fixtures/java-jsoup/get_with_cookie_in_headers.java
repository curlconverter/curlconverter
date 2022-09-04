import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/cookies")
				.header("Pragma", "no-cache")
				.header("Accept-Encoding", "gzip, deflate, br")
				.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
				.header("Accept-Language", "en-US,en;q=0.8")
				.header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
				.header("Referer", "http://www.wikipedia.org/")
				.header("Connection", "keep-alive")
				.header("Sec-Metadata", "destination=empty, site=same-origin")
				.cookie("authCookie", "123")
				.method(Connection.Method.GET)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
