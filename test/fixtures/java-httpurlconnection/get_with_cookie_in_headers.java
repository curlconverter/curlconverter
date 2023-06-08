import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.zip.GZIPInputStream;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/cookies");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("GET");

        httpConn.setRequestProperty("Pragma", "no-cache");
        httpConn.setRequestProperty("Accept-Encoding", "gzip, deflate, br");
        httpConn.setRequestProperty("Accept-Language", "en-US,en;q=0.9");
        httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36");
        httpConn.setRequestProperty("accept", "application/json");
        httpConn.setRequestProperty("Referer", "https://httpbin.org/");
        httpConn.setRequestProperty("Cookie", "authCookie=123");
        httpConn.setRequestProperty("Connection", "keep-alive");
        httpConn.setRequestProperty("Cache-Control", "no-cache");
        httpConn.setRequestProperty("Sec-Metadata", "destination=empty, site=same-origin");

        InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                ? httpConn.getInputStream()
                : httpConn.getErrorStream();
        if ("gzip".equals(httpConn.getContentEncoding())) {
            responseStream = new GZIPInputStream(responseStream);
        }
        Scanner s = new Scanner(responseStream).useDelimiter("\\A");
        String response = s.hasNext() ? s.next() : "";
        System.out.println(response);
    }
}
