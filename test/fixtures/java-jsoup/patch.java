import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {
		byte[] message = ("username:password").getBytes("UTF-8");
		String basicAuth = DatatypeConverter.printBase64Binary(message);

		Connection.Response response = Jsoup.connect("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da")
				.header("Accept", "application/vnd.go.cd.v4+json")
				.header("Content-Type", "application/json")
				.header(Authorization, "Basic " + basicAuth)
				.method(Connection.Method.PATCH)
				.ignoreContentType(true)
				.timeout(30000)
				.execute();

		System.out.println(response.parse());
	}
}
