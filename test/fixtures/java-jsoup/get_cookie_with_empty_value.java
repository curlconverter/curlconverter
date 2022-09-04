import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

    public static void main(String[] args) throws IOException {

        Connection.Response response = Jsoup.connect("https://localhost:28139/cookies")
                .header("accept", "application/json")
                .cookie("mysamplecookie", "someValue")
                .cookie("emptycookie", "")
                .cookie("otherCookie", "2")
                .method(Connection.Method.GET)
                .ignoreContentType(true)
                .timeout(30000)
                .execute();

        System.out.println(response.parse());
    }
}
