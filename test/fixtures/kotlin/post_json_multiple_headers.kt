import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val MEDIA_TYPE = "application/json".toMediaType()

val requestBody = "{\"userName\":\"username123\",\"password\":\"password123\", \"authLoginDomain\":\"local\"}"

val request = Request.Builder()
  .url("http://localhost:28139/rest/login-sessions")
  .post(requestBody.toRequestBody(MEDIA_TYPE))
  .header("Content-Type", "application/json")
  .header("X-API-Version", "200")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
