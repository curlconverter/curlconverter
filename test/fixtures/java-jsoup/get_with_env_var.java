import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.System;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/v2/images?type=distribution")
			.header("Content-Type", "application/json")
			.header("Authorization", "Bearer " + System.getenv("DO_API_TOKEN"))
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
