import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val MEDIA_TYPE = "application/json".toMediaType()

val requestBody = "{\"server_id\": \"00000000000\",\n                   \"shared_server\": {\"library_section_ids\": 00000000000,\n                                     \"invited_id\": 00000000000}\n                   }\n"

val request = Request.Builder()
  .url("http://localhost:28139/api/servers/00000000000/shared_servers/")
  .post(requestBody.toRequestBody(MEDIA_TYPE))
  .header("'Accept'", "'application/json'")
  .header("Authorization", "Bearer 000000000000000-0000")
  .header("Content-Type", "application/json")
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
