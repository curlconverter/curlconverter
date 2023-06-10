import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/page")
			.cookie("secure_user_id", "InNlY3VyZTEwNjI3Ig%3D%3D--3b5df49345735791f2b80eddafb630cdcba76a1d")
			.cookie("adaptive_image", "1440")
			.cookie("has_js", "1")
			.cookie("ccShowCookieIcon", "no")
			.cookie("_web_session", "Y2h...e5")
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
