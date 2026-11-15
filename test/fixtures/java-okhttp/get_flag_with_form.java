import java.io.IOException;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

OkHttpClient client = new OkHttpClient();

RequestBody requestBody = new MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addFormDataPart("name", "value")
    .build();

Request request = new Request.Builder()
    .url("http://localhost:28139/upload")
    .post(requestBody)
    .build();

try (Response response = client.newCall(request).execute()) {
    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
    response.body().string();
}

