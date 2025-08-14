import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient{
    // requires the io.ktor:ktor-client-auth dependency
    install(Auth) {
        basic {
            credentials {
                BasicAuthCredentials("ol'", "asd\"")
            }
            realm = "Access to the '/' path"        }
    }
}

runBlocking {
    val response = client.post("http://localhost:28139") {
        setBody("a=b&c=\"&d='")
        header("A", "''a'")
        header("B", "\"")
        header("Cookie", "x=1'; y=2\"")
        header("Content-Type", "application/x-www-form-urlencoded")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
