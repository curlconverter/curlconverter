import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import javax.xml.bind.DatatypeConverter;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		byte[] message = ("admin:123").getBytes("UTF-8");
		String basicAuth = DatatypeConverter.printBase64Binary(message);

		Connection.Response response = Jsoup.connect("http://localhost:28139/test/_security")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.header("Authorization", "Basic " + basicAuth)
			.requestBody("{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}")
			.method(org.jsoup.Connection.Method.PUT)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
