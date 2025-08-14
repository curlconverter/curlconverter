import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.util.cio.readChannel
import java.io.File
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.put("http://localhost:28139/file.txt") {
        setBody(File("file.txt").readChannel())
        header("Content-Type", "application/x-www-form-urlencoded")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
