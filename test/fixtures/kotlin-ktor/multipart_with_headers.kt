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
    val response = client.post("http://localhost:28139/api/2.0/files/content") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("attributes", "{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}")
                append("file", "myfile.jpg", InputProvider { File("myfile.jpg").inputStream().asInput().buffered() })
            }
    )
)
        header("Authorization", "Bearer ACCESS_TOKEN")
        header("X-Nice", "Header")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
