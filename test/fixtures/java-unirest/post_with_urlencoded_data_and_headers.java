import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/api/Listing.svc/PropertySearch_Post")
            .header("Origin", "http://www.realtor.ca")
            .header("Accept-Encoding", "gzip, deflate")
            .header("Accept-Language", "en-US,en;q=0.8")
            .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36")
            .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
            .header("Accept", "*/*")
            .header("Referer", "http://www.realtor.ca/Residential/Map.aspx")
            .header("Connection", "keep-alive")
            .field("CultureId","1")
            .field("ApplicationId","1")
            .field("RecordsPerPage","200")
            .field("MaximumResults","200")
            .field("PropertyTypeId","300")
            .field("TransactionTypeId","2")
            .field("StoreyRange","0-0")
            .field("BuildingTypeId","1")
            .field("BedRange","0-0")
            .field("BathRange","0-0")
            .field("LongitudeMin","-79.3676805496215")
            .field("LongitudeMax","-79.27300930023185")
            .field("LatitudeMin","43.660358732823845")
            .field("LatitudeMax","43.692390574029936")
            .field("SortOrder","A")
            .field("SortBy","1")
            .field("viewState","m")
            .field("Longitude","-79.4107246398925")
            .field("Latitude","43.6552047278685")
            .field("ZoomLevel","13")
            .field("CurrentPage","1")
            .asString();
    }
}
