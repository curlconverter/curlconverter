import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.get("http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4") {
        header("X-Api-Key", "123456789")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
