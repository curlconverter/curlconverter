import io.ktor.client.HttpClient
import io.ktor.client.request.patch
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.utils.io.streams.asInput
import java.io.File
import kotlinx.coroutines.runBlocking
import kotlinx.io.buffered

val client = HttpClient()

runBlocking {
    val response = client.patch("http://localhost:28139/patch") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("file1", "./test/fixtures/curl_commands/delete.sh", InputProvider { File("./test/fixtures/curl_commands/delete.sh").inputStream().asInput().buffered() })
            }
    )
)
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
