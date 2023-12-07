import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val request = Request.Builder()
  .url("http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4")
  .header("X-Api-Key", "123456789")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
