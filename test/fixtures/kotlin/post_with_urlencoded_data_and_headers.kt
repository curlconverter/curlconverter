import java.io.IOException
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val formBody = FormBody.Builder()
  .add("CultureId", "1")
  .add("ApplicationId", "1")
  .add("RecordsPerPage", "200")
  .add("MaximumResults", "200")
  .add("PropertyTypeId", "300")
  .add("TransactionTypeId", "2")
  .add("StoreyRange", "0-0")
  .add("BuildingTypeId", "1")
  .add("BedRange", "0-0")
  .add("BathRange", "0-0")
  .add("LongitudeMin", "-79.3676805496215")
  .add("LongitudeMax", "-79.27300930023185")
  .add("LatitudeMin", "43.660358732823845")
  .add("LatitudeMax", "43.692390574029936")
  .add("SortOrder", "A")
  .add("SortBy", "1")
  .add("viewState", "m")
  .add("Longitude", "-79.4107246398925")
  .add("Latitude", "43.6552047278685")
  .add("ZoomLevel", "13")
  .add("CurrentPage", "1")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/api/Listing.svc/PropertySearch_Post")
  .post(formBody)
  .header("Origin", "http://www.realtor.ca")
  .header("Accept-Encoding", "gzip, deflate")
  .header("Accept-Language", "en-US,en;q=0.8")
  .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36")
  .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
  .header("Accept", "*/*")
  .header("Referer", "http://www.realtor.ca/Residential/Map.aspx")
  .header("Connection", "keep-alive")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
