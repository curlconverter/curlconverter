import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/post")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.requestBody("secret=*%5*!")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
