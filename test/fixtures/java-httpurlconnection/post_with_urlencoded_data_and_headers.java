import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.zip.GZIPInputStream;

class Main {

    public static void main(String[] args) throws IOException {
        URL url = new URL("http://localhost:28139/api/Listing.svc/PropertySearch_Post");
        HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setRequestMethod("POST");

        httpConn.setRequestProperty("Origin", "http://www.realtor.ca");
        httpConn.setRequestProperty("Accept-Encoding", "gzip, deflate");
        httpConn.setRequestProperty("Accept-Language", "en-US,en;q=0.8");
        httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36");
        httpConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        httpConn.setRequestProperty("Accept", "*/*");
        httpConn.setRequestProperty("Referer", "http://www.realtor.ca/Residential/Map.aspx");
        httpConn.setRequestProperty("Connection", "keep-alive");

        httpConn.setDoOutput(true);
        OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
        writer.write("CultureId=1&ApplicationId=1&RecordsPerPage=200&MaximumResults=200&PropertyTypeId=300&TransactionTypeId=2&StoreyRange=0-0&BuildingTypeId=1&BedRange=0-0&BathRange=0-0&LongitudeMin=-79.3676805496215&LongitudeMax=-79.27300930023185&LatitudeMin=43.660358732823845&LatitudeMax=43.692390574029936&SortOrder=A&SortBy=1&viewState=m&Longitude=-79.4107246398925&Latitude=43.6552047278685&ZoomLevel=13&CurrentPage=1");
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
