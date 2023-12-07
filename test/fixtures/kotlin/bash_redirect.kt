import java.io.File
import java.io.IOException
import okhttp3.Credentials
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody

val client = OkHttpClient()

val credential = Credentials.basic("USER", "PASS");

val MEDIA_TYPE = "text/xml".toMediaType()

val file = File("add_params.xml")

val request = Request.Builder()
  .url("http://localhost:28139/api/2.0/fo/auth/unix/?action=create&title=UnixRecord&username=root&password=abc123&ips=10.10.10.10")
  .post(file.asRequestBody(MEDIA_TYPE))
  .header("X-Requested-With", "curl")
  .header("Content-Type", "text/xml")
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
