import io.ktor.client.HttpClient
import io.ktor.client.request.forms.FormDataContent
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/echo/html/") {
        setBody(
    FormDataContent(
        formData {
                append("msg1", "wow")
                append("msg2", "such")
            }
    )
)
        header("Origin", "http://fiddle.jshell.net")
        header("Accept-Encoding", "gzip, deflate")
        header("Accept-Language", "en-US,en;q=0.8")
        header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36")
        header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        header("Accept", "*/*")
        header("Referer", "http://fiddle.jshell.net/_display/")
        header("X-Requested-With", "XMLHttpRequest")
        header("Connection", "keep-alive")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
