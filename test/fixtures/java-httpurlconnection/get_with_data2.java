import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("PUT");

        httpConn.setRequestProperty("X-Api-Key", "{admin_api_key}");
        httpConn.setRequestProperty("Content-Type", "application/json");

        InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                ? httpConn.getInputStream()
                : httpConn.getErrorStream();
        Scanner s = new Scanner(responseStream).useDelimiter("\\A");
        String response = s.hasNext() ? s.next() : "";
        System.out.println(response);
    }
}
