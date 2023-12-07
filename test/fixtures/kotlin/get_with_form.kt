import java.io.IOException
import okhttp3.Credentials
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request

val client = OkHttpClient()

val credential = Credentials.basic("test", "");

val requestBody = MultipartBody.Builder()
  .setType(MultipartBody.FORM)
  .addFormDataPart("from", "test@tester.com")
  .addFormDataPart("to", "devs@tester.net")
  .addFormDataPart("subject", "Hello")
  .addFormDataPart("text", "Testing the converter!")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/v3")
  .post(requestBody)
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
