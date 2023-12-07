import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val request = Request.Builder()
  .url("http://localhost:28139/endpoint")
  .method("POST", "".toRequestBody())
  .header("Content-Type", "application/json")
  .header("key", "abcdefg")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
