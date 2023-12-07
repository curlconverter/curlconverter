import java.io.IOException
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val formBody = FormBody.Builder()
  .add("msg1", "wow")
  .add("msg2", "such")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/echo/html/")
  .post(formBody)
  .header("Origin", "http://fiddle.jshell.net")
  .header("Accept-Encoding", "gzip, deflate")
  .header("Accept-Language", "en-US,en;q=0.8")
  .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
  .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
  .header("Accept", "*/*")
  .header("Referer", "http://fiddle.jshell.net/_display/")
  .header("X-Requested-With", "XMLHttpRequest")
  .header("Connection", "keep-alive")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
