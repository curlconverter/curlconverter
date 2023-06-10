import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/echo/html/")
			.header("Origin", "http://fiddle.jshell.net")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.requestBody("msg1=value1&msg2=value2")
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
