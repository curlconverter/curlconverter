import java.io.File
import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody

val client = OkHttpClient()

val MEDIA_TYPE = "application/sparql-query".toMediaType()

val file = File("./sample.sparql")

val request = Request.Builder()
  .url("http://localhost:28139/american-art/query")
  .post(file.asRequestBody(MEDIA_TYPE))
  .header("Content-type", "application/sparql-query")
  .header("Accept", "application/sparql-results+json")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
