import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/") {
        setBody("foo=\\\"bar\\\"")
        header("Content-Type", "application/x-www-form-urlencoded")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
