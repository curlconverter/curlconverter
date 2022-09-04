import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		byte[] message = ("foo:bar").getBytes("UTF-8");
		String basicAuth = DatatypeConverter.printBase64Binary(message);

		Connection.Response response = Jsoup.connect("http://localhost:28139/")
				.header("Content-Type", "application/x-www-form-urlencoded")
				.header("Authorization", "Basic " + basicAuth)
				.method(Connection.Method.POST)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
