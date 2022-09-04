import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {

		byte[] message = ("admin:123").getBytes("UTF-8");
		String basicAuth = DatatypeConverter.printBase64Binary(message);

		Connection.Response response = Jsoup.connect("http://localhost:28139/test/_security")
				.header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
				.header("Authorization", "Basic " + basicAuth)
				.requestBody("{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}")
				.method(Connection.Method.PUT)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
