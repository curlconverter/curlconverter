import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.zip.GZIPInputStream;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/api/tunein/queue-and-play?deviceSerialNumber=xxx&deviceType=xxx&guideId=s56876&contentType=station&callSign=&mediaOwnerCustomerId=xxx");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("OPTIONS");

        httpConn.setRequestProperty("Pragma", "no-cache");
        httpConn.setRequestProperty("Access-Control-Request-Method", "POST");
        httpConn.setRequestProperty("Origin", "https://alexa.amazon.de");
        httpConn.setRequestProperty("Accept-Encoding", "gzip, deflate, br");
        httpConn.setRequestProperty("Accept-Language", "de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4");
        httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
        httpConn.setRequestProperty("Accept", "*/*");
        httpConn.setRequestProperty("Cache-Control", "no-cache");
        httpConn.setRequestProperty("Referer", "https://alexa.amazon.de/spa/index.html");
        httpConn.setRequestProperty("Connection", "keep-alive");
        httpConn.setRequestProperty("DNT", "1");
        httpConn.setRequestProperty("Access-Control-Request-Headers", "content-type,csrf");

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
