import java.io.File
import java.io.IOException
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody

val client = OkHttpClient()

val requestBody = MultipartBody.Builder()
  .setType(MultipartBody.FORM)
  .addFormDataPart("files", "47.htz", File("47.htz").asRequestBody())
  .addFormDataPart("name", "47")
  .addFormDataPart("oldMediaId", "47")
  .addFormDataPart("updateInLayouts", "1")
  .addFormDataPart("deleteOldRevisions", "1")
  .build()

val request = Request.Builder()
  .url("http://localhost:28139/api/library")
  .post(requestBody)
  .header("accept", "application/json")
  .header("Content-Type", "multipart/form-data")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
