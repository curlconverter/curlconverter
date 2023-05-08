import java.io.IOException
import okhttp3.Credentials
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val credential = Credentials.basic("", "some_password");

val request = Request.Builder()
  .url("http://localhost:28139/")
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}

