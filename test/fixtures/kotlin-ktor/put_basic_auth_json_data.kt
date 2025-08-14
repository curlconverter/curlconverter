import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import io.ktor.client.request.header
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient{
    // requires the io.ktor:ktor-client-auth dependency
    install(Auth) {
        basic {
            credentials {
                BasicAuthCredentials("admin", "123")
            }
            realm = "Access to the '/' path"        }
    }
}

runBlocking {
    val response = client.put("http://localhost:28139/test/_security") {
        setBody("{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}")
        header("Content-Type", "application/x-www-form-urlencoded")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
