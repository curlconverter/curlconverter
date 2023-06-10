import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id")
			.header("X-Api-Key", "{admin_api_key}")
			.header("Content-Type", "application/json")
			.method(org.jsoup.Connection.Method.PUT)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
