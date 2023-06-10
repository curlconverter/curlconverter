import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/?format=json&")
			.header("Host", "api.ipify.org")
			.header("Accept", "*/*")
			.userAgent("GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)")
			.header("Accept-Language", "en-CN;q=1, zh-Hans-CN;q=0.9")
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
