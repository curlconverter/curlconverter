import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:8888/")
			.header("Cookie", "a=b; c")
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
