import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import java.lang.Runtime
import java.util.Scanner
import kotlinx.coroutines.runBlocking

fun exec(cmd: String): String {
  try {
    val p = Runtime.getRuntime().exec(cmd)
    p.waitFor()
    val s = Scanner(p.getInputStream()).useDelimiter("\\A")
    return s.hasNext() ? s.next() : ""
  } catch (Exception e) {
    return ""
  }
}

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139") {
        setBody("foo&@" + exec("echo myfile.jg"))
        header("Content-Type", "application/x-www-form-urlencoded")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
