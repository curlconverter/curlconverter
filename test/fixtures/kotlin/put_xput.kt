import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val MEDIA_TYPE = "application/json".toMediaType()

val requestBody = "{\"properties\": {\"email\": {\"type\": \"keyword\"}}}"

val request = Request.Builder()
  .url("http://localhost:28139/twitter/_mapping/user?pretty")
  .put(requestBody.toRequestBody(MEDIA_TYPE))
  .header("Content-Type", "application/json")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
