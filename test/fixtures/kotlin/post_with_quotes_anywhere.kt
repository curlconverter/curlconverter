import java.io.IOException
import okhttp3.Credentials
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val credential = Credentials.basic("ol'", "asd\"");

val MEDIA_TYPE = "application/x-www-form-urlencoded".toMediaType()

val requestBody = "a=b&c=\"&d='"

val request = Request.Builder()
  .url("http://localhost:28139")
  .post(requestBody.toRequestBody(MEDIA_TYPE))
  .header("A", "''a'")
  .header("B", "\"")
  .header("Cookie", "x=1'; y=2\"")
  .header("Content-Type", "application/x-www-form-urlencoded")
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
