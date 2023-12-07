import java.io.IOException
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val requestBody = MultipartBody.Builder()
  .setType(MultipartBody.FORM)
  .addFormDataPart("username", "davidwalsh")
  .addFormDataPart("password", "something")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/post-to-me.php")
  .post(requestBody)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
