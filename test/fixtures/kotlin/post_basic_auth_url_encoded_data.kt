import java.io.IOException
import okhttp3.Credentials
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val credential = Credentials.basic("foo", "bar");

val formBody = FormBody.Builder()
  .add("grant_type", "client_credentials")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/api/oauth/token/")
  .post(formBody)
  .header("Content-Type", "application/x-www-form-urlencoded")
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
