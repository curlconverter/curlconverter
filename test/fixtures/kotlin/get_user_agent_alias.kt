import java.io.IOException
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val request = Request.Builder()
  .url("http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812")
  .header("x-msisdn", "XXXXXXXXXXXXX")
  .header("user-agent", "Mozilla Android6.1")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
