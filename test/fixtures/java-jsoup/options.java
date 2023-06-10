import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/api/tunein/queue-and-play?deviceSerialNumber=xxx&deviceType=xxx&guideId=s56876&contentType=station&callSign=&mediaOwnerCustomerId=xxx")
			.header("Pragma", "no-cache")
			.header("Access-Control-Request-Method", "POST")
			.header("Origin", "https://alexa.amazon.de")
			.header("Accept-Encoding", "gzip, deflate, br")
			.header("Accept-Language", "de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4")
			.userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
			.header("Accept", "*/*")
			.header("Cache-Control", "no-cache")
			.header("Referer", "https://alexa.amazon.de/spa/index.html")
			.header("Connection", "keep-alive")
			.header("DNT", "1")
			.header("Access-Control-Request-Headers", "content-type,csrf")
			.method(org.jsoup.Connection.Method.OPTIONS)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
