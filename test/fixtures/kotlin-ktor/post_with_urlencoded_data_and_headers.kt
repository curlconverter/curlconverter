import io.ktor.client.HttpClient
import io.ktor.client.request.forms.FormDataContent
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/api/Listing.svc/PropertySearch_Post") {
        setBody(
    FormDataContent(
        formData {
                append("CultureId", "1")
                append("ApplicationId", "1")
                append("RecordsPerPage", "200")
                append("MaximumResults", "200")
                append("PropertyTypeId", "300")
                append("TransactionTypeId", "2")
                append("StoreyRange", "0-0")
                append("BuildingTypeId", "1")
                append("BedRange", "0-0")
                append("BathRange", "0-0")
                append("LongitudeMin", "-79.3676805496215")
                append("LongitudeMax", "-79.27300930023185")
                append("LatitudeMin", "43.660358732823845")
                append("LatitudeMax", "43.692390574029936")
                append("SortOrder", "A")
                append("SortBy", "1")
                append("viewState", "m")
                append("Longitude", "-79.4107246398925")
                append("Latitude", "43.6552047278685")
                append("ZoomLevel", "13")
                append("CurrentPage", "1")
            }
    )
)
        header("Origin", "http://www.realtor.ca")
        header("Accept-Encoding", "gzip, deflate")
        header("Accept-Language", "en-US,en;q=0.8")
        header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36")
        header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        header("Accept", "*/*")
        header("Referer", "http://www.realtor.ca/Residential/Map.aspx")
        header("Connection", "keep-alive")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
