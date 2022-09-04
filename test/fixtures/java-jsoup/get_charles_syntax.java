import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/?format=json&")
				.header("Host", "api.ipify.org")
				.header("Accept", "*/*")
				.userAgent("GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)")
				.header("Language", "en-CN;q=1, zh-Hans-CN;q=0.9")

				.method(Connection.Method.GET)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
