import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.get("http://localhost:28139/?format=json&") {
        header("Host", "api.ipify.org")
        header("Accept", "*/*")
        header("User-Agent", "GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)")
        header("Accept-Language", "en-CN;q=1, zh-Hans-CN;q=0.9")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
