import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.util.cio.readChannel
import java.io.File
import kotlinx.coroutines.runBlocking

val client = HttpClient{
    // requires the io.ktor:ktor-client-auth dependency
    install(Auth) {
        basic {
            credentials {
                BasicAuthCredentials("USER", "PASS")
            }
            realm = "Access to the '/' path"        }
    }
}

runBlocking {
    val response = client.post("http://localhost:28139/api/2.0/fo/auth/unix/?action=create&title=UnixRecord&username=root&password=abc123&ips=10.10.10.10") {
        setBody(File("add_params.xml").readChannel())
        header("X-Requested-With", "curl")
        header("Content-Type", "text/xml")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
