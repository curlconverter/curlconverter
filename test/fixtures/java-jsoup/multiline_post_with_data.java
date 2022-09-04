import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

			Connection.Response response = Jsoup.connect("http://localhost:28139/echo/html/")
					.header("Origin", "http://fiddle.jshell.net")
					.header("Content-Type", "application/x-www-form-urlencoded")
					.requestBody("{\"msg1\":\"value1\",\"msg2\":\"value2\"}")
					.method(Connection.Method.GET)
					.ignoreContentType(true)
					.timeout(30000)
					.execute();

			System.out.println(response.parse());
		}
	}
