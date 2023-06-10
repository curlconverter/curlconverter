import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/patch")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.requestBody("item[]=1&item[]=2&item[]=3")
			.method(org.jsoup.Connection.Method.PATCH)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
