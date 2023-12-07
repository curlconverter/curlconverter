import java.io.IOException
import java.util.concurrent.TimeUnit
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient().newBuilder()
  .callTimeout(6.72, TimeUnit.SECONDS)
  .connectTimeout(13.9999, TimeUnit.SECONDS)
  .build()

val request = Request.Builder()
  .url("http://localhost:28139")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
