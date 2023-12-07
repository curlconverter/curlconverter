import java.io.IOException
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val formBody = FormBody.Builder()
  .add("msg1", "value1")
  .add("msg2", "value2")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/echo/html/")
  .method("GET", formBody)
  .header("Origin", "http://fiddle.jshell.net")
  .header("Content-Type", "application/x-www-form-urlencoded")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
