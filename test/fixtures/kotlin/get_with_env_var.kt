import java.io.IOException
import java.lang.System
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val request = Request.Builder()
  .url("http://localhost:28139/v2/images?type=distribution")
  .header("Content-Type", "application/json")
  .header("Authorization", "Bearer " + System.getenv("DO_API_TOKEN") ?: "")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
