import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import javax.xml.bind.DatatypeConverter;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		byte[] message = ("username:password").getBytes("UTF-8");
		String basicAuth = DatatypeConverter.printBase64Binary(message);

		Connection.Response response = Jsoup.connect("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da")
			.header("Accept", "application/vnd.go.cd.v4+json")
			.header("Content-Type", "application/json")
			.header("Authorization", "Basic " + basicAuth)
			.requestBody("{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }")
			.method(org.jsoup.Connection.Method.PATCH)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
