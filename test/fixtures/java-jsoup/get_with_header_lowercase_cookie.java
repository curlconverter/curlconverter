import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/page")
				.cookie("secure_user_id", "InNlY3VyZTEwNjI3Ig%3D%3D--3b5df49345735791f2b80eddafb630cdcba76a1d")
				.cookie("adaptive_image", "1440")
				.cookie("ccShowCookieIcon", "no")
				.cookie("_web_session", "Y2h...e5")
				.method(Connection.Method.GET)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
