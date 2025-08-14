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
    val response = client.post("http://localhost:28139/api/servers/00000000000/shared_servers/") {
        setBody(File("-").readChannel())
        header("'Accept'", "'application/json'")
        header("Authorization", "Bearer 000000000000000-0000")
        header("Content-Type", "application/json")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
