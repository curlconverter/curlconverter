import java.io.IOException
import okhttp3.Credentials
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()

val credential = Credentials.basic("username", "password");

val MEDIA_TYPE = "application/json".toMediaType()

val requestBody = "{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }"

val request = Request.Builder()
  .url("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da")
  .patch(requestBody.toRequestBody(MEDIA_TYPE))
  .header("Accept", "application/vnd.go.cd.v4+json")
  .header("Content-Type", "application/json")
  .header("Authorization", credential)
  .build()

client.newCall(request).execute().use { response ->
  if (!response.isSuccessful) throw IOException("Unexpected code $response")
  response.body!!.string()
}
