import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import javax.xml.bind.DatatypeConverter;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("GET");

        byte[] message = (":some_password").getBytes("UTF-8");
        String basicAuth = DatatypeConverter.printBase64Binary(message);
        httpConn.setRequestProperty("Authorization", "Basic " + basicAuth);

        InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                ? httpConn.getInputStream()
                : httpConn.getErrorStream();
        Scanner s = new Scanner(responseStream).useDelimiter("\\A");
        String response = s.hasNext() ? s.next() : "";
        System.out.println(response);
    }
}
