import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.util.cio.readChannel
import java.io.File
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/american-art/query") {
        setBody(File("./sample.sparql").readChannel())
        header("Content-type", "application/sparql-query")
        header("Accept", "application/sparql-results+json")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
