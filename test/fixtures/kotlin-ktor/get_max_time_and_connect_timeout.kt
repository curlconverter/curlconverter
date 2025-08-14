import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient{
    install(HttpTimeout) {
        requestTimeoutMillis = 6000
        connectTimeoutMillis = 13000
    }
}

runBlocking {
    val response = client.get("http://localhost:28139")
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
