import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
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
                BasicAuthCredentials("test", "")
            }
            realm = "Access to the '/' path"        }
    }
}

runBlocking {
    val response = client.post("http://localhost:28139/v3") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("from", "test@tester.com")
                append("to", "devs@tester.net")
                append("subject", "Hello")
                append("text", "Testing the converter!")
            }
    )
)
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
