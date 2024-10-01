import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

class Main {
    public static void main(String[] args) throws FileNotFoundException {
            HttpResponse<String> httpResponse
               = Unirest.post("http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence")
            .header("Content-Type", "multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW")
            .header("Authorization", "Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg")
            .field("input","{\"evidences\": [{  \"evidence_type\": \"PROOF_OF_FULFILLMENT\",  \"evidence_info\": {  \"tracking_info\": [    {    \"carrier_name\": \"OTHER\",    \"tracking_number\": \"122533485\"    }  ]  },  \"notes\": \"Test\"}  ]}")
            .field("file1", new FileInputStream(new File("NewDoc.pdf")), "NewDoc.pdf")
            .asString();
    }
}
