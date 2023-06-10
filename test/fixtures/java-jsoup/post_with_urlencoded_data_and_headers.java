import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;


class Main {

	public static void main(String[] args) throws IOException {
		Connection.Response response = Jsoup.connect("http://localhost:28139/api/Listing.svc/PropertySearch_Post")
			.header("Origin", "http://www.realtor.ca")
			.header("Accept-Encoding", "gzip, deflate")
			.header("Accept-Language", "en-US,en;q=0.8")
			.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36")
			.header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
			.header("Accept", "*/*")
			.header("Referer", "http://www.realtor.ca/Residential/Map.aspx")
			.header("Connection", "keep-alive")
			.requestBody("CultureId=1&ApplicationId=1&RecordsPerPage=200&MaximumResults=200&PropertyTypeId=300&TransactionTypeId=2&StoreyRange=0-0&BuildingTypeId=1&BedRange=0-0&BathRange=0-0&LongitudeMin=-79.3676805496215&LongitudeMax=-79.27300930023185&LatitudeMin=43.660358732823845&LatitudeMax=43.692390574029936&SortOrder=A&SortBy=1&viewState=m&Longitude=-79.4107246398925&Latitude=43.6552047278685&ZoomLevel=13&CurrentPage=1")
			.method(org.jsoup.Connection.Method.POST)
			.ignoreContentType(true)
			.execute();

		System.out.println(response.parse());
	}
}
