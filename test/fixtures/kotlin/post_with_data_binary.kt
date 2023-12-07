import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val MEDIA_TYPE = "application/x-www-form-urlencoded".toMediaType()

val requestBody = "{\"title\":\"china1\"}"

val request = Request.Builder()
  .url("http://localhost:28139/post")
  .post(requestBody.toRequestBody(MEDIA_TYPE))
  .header("Content-Type", "application/x-www-form-urlencoded")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
