import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/ajax/demo_post.asp")
			.header("Origin", "http://www.w3schools.com")
			.header("Accept-Encoding", "gzip, deflate")
			.header("Accept-Language", "en-US,en;q=0.8")
			.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
			.header("Accept", "*/*")
			.header("Referer", "http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511")
			.cookie("_gat", "1")
			.cookie("ASPSESSIONIDACCRDTDC", "MCMDKFMBLLLHGKCGNMKNGPKI")
			.cookie("_ga", "GA1.2.1424920226.1419478126")
			.header("Connection", "keep-alive")
			.header("Content-Length", "0")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
