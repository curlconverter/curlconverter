import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.get("http://localhost:28139/api/retail/books/list") {
        header("Accept", "application/json")
        header("user-token", "75d7ce4350c7d6239347bf23d3a3e668")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
