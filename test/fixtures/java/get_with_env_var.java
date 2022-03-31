import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {
		URL url = new URL("https://api.digitalocean.com/v2/images?type=distribution");
		HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
		httpConn.setRequestMethod("GET");

		httpConn.setRequestProperty("Content-Type", "application/json");
		httpConn.setRequestProperty("Authorization", "Bearer $DO_API_TOKEN");

		InputStream responseStream = httpConn.getResponseCode() / 100 == 2
				? httpConn.getInputStream()
				: httpConn.getErrorStream();
		Scanner s = new Scanner(responseStream).useDelimiter("\\A");
		String response = s.hasNext() ? s.next() : "";
		System.out.println(response);
	}
}
