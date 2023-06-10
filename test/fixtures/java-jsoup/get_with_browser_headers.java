import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/")
			.header("Accept-Encoding", "gzip, deflate, sdch")
			.header("Accept-Language", "en-US,en;q=0.8")
			.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
			.header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
			.header("Referer", "http://www.wikipedia.org/")
			.cookie("GeoIP", "US:Albuquerque:35.1241:-106.7675:v4")
			.cookie("uls-previous-languages", "%5B%22en%22%5D")
			.cookie("mediaWiki.user.sessionId", "VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y")
			.cookie("centralnotice_buckets_by_campaign", "%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D")
			.cookie("centralnotice_bannercount_fr12", "22")
			.cookie("centralnotice_bannercount_fr12-wait", "14")
			.header("Connection", "keep-alive")
			.method(org.jsoup.Connection.Method.GET)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
