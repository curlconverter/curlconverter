import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.zip.GZIPInputStream;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/ajax/demo_post.asp");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("POST");

        httpConn.setRequestProperty("Origin", "http://www.w3schools.com");
        httpConn.setRequestProperty("Accept-Encoding", "gzip, deflate");
        httpConn.setRequestProperty("Accept-Language", "en-US,en;q=0.8");
        httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
        httpConn.setRequestProperty("Accept", "*/*");
        httpConn.setRequestProperty("Referer", "http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511");
        httpConn.setRequestProperty("Cookie", "_gat=1; ASPSESSIONIDACCRDTDC=MCMDKFMBLLLHGKCGNMKNGPKI; _ga=GA1.2.1424920226.1419478126");
        httpConn.setRequestProperty("Connection", "keep-alive");
        httpConn.setRequestProperty("Content-Length", "0");

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
