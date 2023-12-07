import java.io.File
import java.io.IOException
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody

val client = OkHttpClient()

val requestBody = MultipartBody.Builder()
  .setType(MultipartBody.FORM)
  .addFormDataPart("image", "image.jpg", File("image.jpg").asRequestBody())
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/targetservice")
  .post(requestBody)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
