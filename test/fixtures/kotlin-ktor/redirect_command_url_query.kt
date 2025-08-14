import io.ktor.client.HttpClient
import io.ktor.client.request.get
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
    val response = client.get("http://localhost:28139?@" + exec("echo image.jpg"))
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
