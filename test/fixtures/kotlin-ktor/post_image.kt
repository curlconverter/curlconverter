import io.ktor.client.HttpClient
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
    val response = client.post("http://localhost:28139/targetservice") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("image", "image.jpg", InputProvider { File("image.jpg").inputStream().asInput().buffered() })
            }
    )
)
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
