import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		Connection.Response response = Jsoup.connect("http://localhost:28139/api/service.svc?action=CreateItem&ID=-37&AC=1")
				.header("Content-Type", "application/x-www-form-urlencoded")
				.method(Connection.Method.POST)
				.header("Origin", "https://nih.mail.edu.fr")
				.header("Accept-Encoding", "gzip, deflate, br")
				.header("X-EWS-TargetVersion", "2.5")
				.header("Accept-Language", "en-US,en;q=0.8")
				.userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36")
				.header("X-OWA-CANARY", "VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.")
				.header("X-OWA-ActionName", "CreateMessageForComposeSend")
				.header("X-OWA-ActionId", "-37")
				.header("X-OWA-ServiceUnavailableOnTransientError", "true")
				.header("Content-Type", "application/json; charset=UTF-8")
				.header("Accept", "*/*")
				.header("Referer", "https://localhost/api/")
				.header("X-OWA-ClientBuildVersion", "15.0.1236.3")
				.header"X-OWA-CorrelationId", "2f11f8fb-f6c6-43a5-881d-8a1b242a4e70_148023102251337")
				.header("DNT", "1")
				.header("X-OWA-ClientBegin", "2016-11-27T07:17:02.513")
				.header("X-OWA-Attempt", "1")
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
