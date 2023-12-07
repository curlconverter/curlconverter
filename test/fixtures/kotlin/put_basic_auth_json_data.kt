import java.io.IOException
import okhttp3.Credentials
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val credential = Credentials.basic("admin", "123");

val MEDIA_TYPE = "application/x-www-form-urlencoded".toMediaType()

val requestBody = "{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}"

val request = Request.Builder()
  .url("http://localhost:28139/test/_security")
  .put(requestBody.toRequestBody(MEDIA_TYPE))
  .header("Content-Type", "application/x-www-form-urlencoded")
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
