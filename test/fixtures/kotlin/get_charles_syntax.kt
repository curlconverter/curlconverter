import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val request = Request.Builder()
  .url("http://localhost:28139/?format=json&")
  .header("Host", "api.ipify.org")
  .header("Accept", "*/*")
  .header("User-Agent", "GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)")
  .header("Accept-Language", "en-CN;q=1, zh-Hans-CN;q=0.9")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
