import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/api/Listing.svc/PropertySearch_Post")
				.header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
				.requestBody("{\"CultureId\":\"1\",\"RecordsPerPage\":\"200\"}")
				.header("Origin", "http://www.realtor.ca");
				.header("Accept-Encoding", "gzip, deflate");
				.header("Accept-Language", "en-US,en;q=0.8");
				.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36");
				.header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
				.header("Accept", "*/*");
				.header("Referer", "http://www.realtor.ca/Residential/Map.aspx");
				.header("Connection", "keep-alive");
				.method(Connection.Method.POST)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
