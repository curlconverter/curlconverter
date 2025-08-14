import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.utils.io.streams.asInput
import java.io.File
import kotlinx.coroutines.runBlocking
import kotlinx.io.buffered

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("input", "{\"evidences\": [{  \"evidence_type\": \"PROOF_OF_FULFILLMENT\",  \"evidence_info\": {  \"tracking_info\": [    {    \"carrier_name\": \"OTHER\",    \"tracking_number\": \"122533485\"    }  ]  },  \"notes\": \"Test\"}  ]}")
                append("file1", "NewDoc.pdf", InputProvider { File("NewDoc.pdf").inputStream().asInput().buffered() })
            }
    )
)
        header("Content-Type", "multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW")
        header("Authorization", "Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
