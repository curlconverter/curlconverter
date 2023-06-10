import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import javax.xml.bind.DatatypeConverter;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		byte[] message = ("foo:bar").getBytes("UTF-8");
		String basicAuth = DatatypeConverter.printBase64Binary(message);

		Connection.Response response = Jsoup.connect("http://localhost:28139/api/oauth/token/")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.header("Authorization", "Basic " + basicAuth)
			.requestBody("grant_type=client_credentials")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
