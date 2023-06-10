import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/twitter/_mapping/user?pretty")
			.header("Content-Type", "application/json")
			.requestBody("{\"properties\": {\"email\": {\"type\": \"keyword\"}}}")
			.method(org.jsoup.Connection.Method.PUT)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
