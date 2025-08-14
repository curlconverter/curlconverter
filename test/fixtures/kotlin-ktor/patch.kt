import io.ktor.client.HttpClient
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient{
    // requires the io.ktor:ktor-client-auth dependency
    install(Auth) {
        basic {
            credentials {
                BasicAuthCredentials("username", "password")
            }
            realm = "Access to the '/' path"        }
    }
}

runBlocking {
    val response = client.patch("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da") {
        setBody("{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }")
        header("Accept", "application/vnd.go.cd.v4+json")
        header("Content-Type", "application/json")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
