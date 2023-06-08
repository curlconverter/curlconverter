import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.zip.GZIPInputStream;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/echo/html/");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("POST");

        httpConn.setRequestProperty("Origin", "http://fiddle.jshell.net");
        httpConn.setRequestProperty("Accept-Encoding", "gzip, deflate");
        httpConn.setRequestProperty("Accept-Language", "en-US,en;q=0.8");
        httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
        httpConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        httpConn.setRequestProperty("Accept", "*/*");
        httpConn.setRequestProperty("Referer", "http://fiddle.jshell.net/_display/");
        httpConn.setRequestProperty("X-Requested-With", "XMLHttpRequest");
        httpConn.setRequestProperty("Connection", "keep-alive");

        httpConn.setDoOutput(true);
        OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
        writer.write("msg1=wow&msg2=such");
        writer.flush();
        writer.close();
        httpConn.getOutputStream().close();

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
