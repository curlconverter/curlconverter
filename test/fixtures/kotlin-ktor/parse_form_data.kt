import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

val client = HttpClient()

runBlocking {
    val response = client.post("http://localhost:28139/wp-json/contact-form-7/v1/contact-forms/295/feedback") {
        setBody(
    MultiPartFormDataContent(
        formData {
                append("_wpcf7", "295")
                append("_wpcf7_version", "5.1.4")
                append("_wpcf7_locale", "en_US")
                append("_wpcf7_unit_tag", "wpcf7-f295-o1")
                append("_wpcf7_container_post", "0")
                append("your-name", "test")
                append("your-email", "example@example.com")
                append("your-subject", "test")
                append("your-message", "test")
                append("send_c[]", "Send copy to yourself")
            }
    )
)
        header("authority", "sgg.ae")
        header("accept", "application/json, text/javascript, */*; q=0.01")
        header("accept-language", "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")
        header("content-type", "multipart/form-data; boundary=----WebKitFormBoundaryXSzdE07OT2MkeOO7")
        header("cookie", "pll_language=en")
        header("origin", "https://sgg.ae")
        header("referer", "https://sgg.ae/contact-us/")
        header("sec-ch-ua", "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"")
        header("sec-ch-ua-mobile", "?0")
        header("sec-ch-ua-platform", "\"Windows\"")
        header("sec-fetch-dest", "empty")
        header("sec-fetch-mode", "cors")
        header("sec-fetch-site", "same-origin")
        header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36")
        header("x-requested-with", "XMLHttpRequest")
    }
    if (!response.status.isSuccess()) throw Exception("Request failed with status code ${response.status}")

    println(response.bodyAsText())
}
