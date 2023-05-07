import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/?format=json&");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("GET");

        httpConn.setRequestProperty("Host", "api.ipify.org");
        httpConn.setRequestProperty("Accept", "*/*");
        httpConn.setRequestProperty("User-Agent", "GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)");
        httpConn.setRequestProperty("Accept-Language", "en-CN;q=1, zh-Hans-CN;q=0.9");

        InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                ? httpConn.getInputStream()
                : httpConn.getErrorStream();
        Scanner s = new Scanner(responseStream).useDelimiter("\\A");
        String response = s.hasNext() ? s.next() : "";
        System.out.println(response);
    }
}
