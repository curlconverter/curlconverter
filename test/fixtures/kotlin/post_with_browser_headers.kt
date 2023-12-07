import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val request = Request.Builder()
  .url("http://localhost:28139/ajax/demo_post.asp")
  .method("POST", "".toRequestBody())
  .header("Origin", "http://www.w3schools.com")
  .header("Accept-Encoding", "gzip, deflate")
  .header("Accept-Language", "en-US,en;q=0.8")
  .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
  .header("Accept", "*/*")
  .header("Referer", "http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511")
  .header("Cookie", "_gat=1; ASPSESSIONIDACCRDTDC=MCMDKFMBLLLHGKCGNMKNGPKI; _ga=GA1.2.1424920226.1419478126")
  .header("Connection", "keep-alive")
  .header("Content-Length", "0")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
