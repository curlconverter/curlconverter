import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/api/tunein/queue-and-play?deviceSerialNumber=xxx&deviceType=xxx&guideId=s56876&contentType=station&callSign=&mediaOwnerCustomerId=xxx")
				.userAgent("Content-Type", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
				.header("Accept", "*/*")
				.header("Cache-Control", "no-cache")
				.header("Referer", "https://alexa.amazon.de/spa/index.html")
				.header("Connection", "keep-alive")
				.header("DNT", "1")
				.header("Access-Control-Request-Headers", "content-type,csrf")
				.method(Connection.Method.OPTIONS)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
