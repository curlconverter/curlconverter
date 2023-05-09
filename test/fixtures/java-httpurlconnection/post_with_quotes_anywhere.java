import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import javax.xml.bind.DatatypeConverter;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("POST");

        httpConn.setRequestProperty("A", "''a'");
        httpConn.setRequestProperty("B", "\"");
        httpConn.setRequestProperty("Cookie", "x=1'; y=2\"");
        httpConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        byte[] message = ("ol':asd\"").getBytes("UTF-8");
        String basicAuth = DatatypeConverter.printBase64Binary(message);
        httpConn.setRequestProperty("Authorization", "Basic " + basicAuth);

        httpConn.setDoOutput(true);
        OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
        writer.write("a=b&c=\"&d='");
        writer.flush();
        writer.close();
        httpConn.getOutputStream().close();

        InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                ? httpConn.getInputStream()
                : httpConn.getErrorStream();
        Scanner s = new Scanner(responseStream).useDelimiter("\\A");
        String response = s.hasNext() ? s.next() : "";
        System.out.println(response);
    }
}
