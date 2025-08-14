import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.utils.io.streams.asInput
import java.io.File
import kotlinx.coroutines.runBlocking
import kotlinx.io.buffered

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/api/library") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("files", "47.htz", InputProvider { File("47.htz").inputStream().asInput().buffered() })
                append("name", "47")
                append("oldMediaId", "47")
                append("updateInLayouts", "1")
                append("deleteOldRevisions", "1")
            }
    )
)
        header("accept", "application/json")
        header("Content-Type", "multipart/form-data")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
