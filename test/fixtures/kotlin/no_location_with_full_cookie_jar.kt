import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient().newBuilder()
  .followRedirects(false)
  .followSslRedirects(false)
  .build()

val request = Request.Builder()
  .url("http://localhost:28139")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
