import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812")
			.header("x-msisdn", "XXXXXXXXXXXXX")
			.userAgent("Mozilla Android6.1")
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
