import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/echo/html/")
			.header("Origin", "http://fiddle.jshell.net")
			.header("Accept-Encoding", "gzip, deflate")
			.header("Accept-Language", "en-US,en;q=0.8")
			.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
			.header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
			.header("Accept", "*/*")
			.header("Referer", "http://fiddle.jshell.net/_display/")
			.header("X-Requested-With", "XMLHttpRequest")
			.header("Connection", "keep-alive")
			.requestBody("msg1=wow&msg2=such")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
