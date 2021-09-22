import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Main {

	public static void main(String[] args) throws IOException {
		URL url = new URL("https://localhost/api/service.svc?action=CreateItem&ID=-37&AC=1");
		HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
		httpConn.setRequestMethod("POST");

		httpConn.setRequestProperty("Origin", "https://nih.mail.edu.fr");
		httpConn.setRequestProperty("Accept-Encoding", "gzip, deflate, br");
		httpConn.setRequestProperty("X-EWS-TargetVersion", "2.5");
		httpConn.setRequestProperty("Accept-Language", "en-US,en;q=0.8");
		httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36");
		httpConn.setRequestProperty("Action", "CreateItem");
		httpConn.setRequestProperty("X-Requested-With", "XMLHttpRequest");
		httpConn.setRequestProperty("Connection", "keep-alive");
		httpConn.setRequestProperty("X-OWA-CANARY", "VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.");
		httpConn.setRequestProperty("X-OWA-ActionName", "CreateMessageForComposeSend");
		httpConn.setRequestProperty("X-OWA-ActionId", "-37");
		httpConn.setRequestProperty("X-OWA-ServiceUnavailableOnTransientError", "true");
		httpConn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
		httpConn.setRequestProperty("Accept", "*/*");
		httpConn.setRequestProperty("Referer", "https://localhost/api/");
		httpConn.setRequestProperty("X-OWA-ClientBuildVersion", "15.0.1236.3");
		httpConn.setRequestProperty("X-OWA-CorrelationId", "2f11f8fb-f6c6-43a5-881d-8a1b242a4e70_148023102251337");
		httpConn.setRequestProperty("DNT", "1");
		httpConn.setRequestProperty("X-OWA-ClientBegin", "2016-11-27T07:17:02.513");
		httpConn.setRequestProperty("X-OWA-Attempt", "1");

		httpConn.setRequestProperty("Cookie", "X-BackEndCookie=S-1-5-21-1234556-56678-12345-2345=alphanumericstring12345/anotheralphanumericstring12345/scsiAdf/P; ClientId=LoremIupsum; PrivateComputer=true; PBack=0; cadata=bx88rrCBehITlBWSozO2l2hlFGu//JjT1/k6dewX5shV32jANUZSMU6GR+M25B6YpBODEgXzxfIHDnvxNC6SJoaE/d8RWX3uDnbkd+m91jNhMXNSYIRYTJHVFdPG06AE; cadataTTL=NfDhBViTJMUdC+ir+6BYvg==; cadataKey=qUY+OLTD9V14CFK6/CUPyrJWMxl1FFqZFjB8/qcS0/q55eqGvP9bWvX+XuSYVv3hIGAn9QNPhIDK6NP9LwCBdu25f2BUFDUWJruGO8MW02izSWzRUnni00xWQq3Y3nNKvpvO+OIR641BPHVZ0+lzCw2Wt8uzEnryCWAjlleozF/XWjpTN4/AaTmcIjEZUDN+fo4494rD0mADtEHv2gmd5mhLe+iyii/L9nAB3UuiJomwbRbKgy22Tj8cyavmLC4ZaViqW9E102NOLU4FYLgdZVET+mbdg==; cadataIV=bTM88YL1zmz7FsBEB0y3nI2SrdSTy+KLxCpx2FRfIZYFo2spN1IHQMSCT76OXrg79sVPhyqXk+N9rOj6M9KsQl4KqMNVBcoXgp24POpgoTwd4FBmKtAYbd9SDErna3jrMO168ML9PDG18K3CnBf6YG1tsIs0gXOEP9LzHVmUPF7KCKqUFiOiZGWuwmPhl85eo77BbEpVN2JkPnzuQWn6tC0cY4f2cJDlr3Z23SrAUVwwXmgRg2DXfOF5MIEkpwYiiI6sABCD9rsSnE6zTXlvZg33hjiD/ywUV1ZWjI2M/4zBixa4s150+dOnMmvtEFs/nOMnvMJui4PEDlTA==; cadataSig=WL3hB+av7sO3bzjL+Efe5b4exnvQxSInH3U5jDvfnPcttSp0XUF3y/NB573C0CTBYuOH/40smFssXlrKhT9tG2ITivdSIIamOmarmC8XwFOv9qQIFMHofcO/jjRDMqF0qRk7WBAC2FgBQrf2Tvq7wk5IX/JHn6zhlgKALAAqH9L9JNC244etnjj9YNaMDYEHV2M2jVTu3FsELqw1rSSqp0hEBlh+aFBvYCBg5hS1mVI76ZCHZVa0OUejiH2yiZyJIKHUI+Sv0rpU3iiQNtIFmGEdwhoo/rga4s4Dc2UsJLQ8c0yGlZgflYs+7Q5gPr74/mTUin60ej/w3M0roUl3FQ==; UC=d8be544621964f3c9865b3ee872fd432; AppcacheVer=15.0.1236.3:en-usbase; X-OWA-CANARY=VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.");

		httpConn.setDoOutput(true);
		OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
		writer.write("{\"__type\":\"CreateItemJsonRequest:#Exchange\",\"Header\":{\"__type\":\"JsonRequestHeaders:#Exchange\",\"RequestServerVersion\":\"Exchange2013\",\"TimeZoneContext\":{\"__type\":\"TimeZoneContext:#Exchange\",\"TimeZoneDefinition\":{\"__type\":\"TimeZoneDefinitionType:#Exchange\",\"Id\":\"France Standard Time\"}}},\"Body\":{\"__type\":\"CreateItemRequest:#Exchange\",\"Items\":[{\"__type\":\"Message:#Exchange\",\"Subject\":\"API\",\"Body\":{\"__type\":\"BodyContentType:#Exchange\",\"BodyType\":\"HTML\",\"Value\":\"<html><head><meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\"><style type=\\\"text/css\\\" style=\\\"display:none\\\"><!-- p { margin-top: 0px; margin-bottom: 0px; }--></style></head><body dir=\\\"ltr\\\" style=\\\"font-size:12pt;color:#000000;background-color:#FFFFFF;font-family:Calibri,Arial,Helvetica,sans-serif;\\\"><p>API Test for NickC<br></p></body></html>\"},\"Importance\":\"Normal\",\"From\":null,\"ToRecipients\":[{\"Name\":\"George LUCAS\",\"EmailAddress\":\"George.LUCAS@nih.mail.edu.fr\",\"RoutingType\":\"SMTP\",\"MailboxType\":\"Mailbox\",\"OriginalDisplayName\":\"George.LUCAS@nih.mail.edu.fr\",\"SipUri\":\" \"}],\"CcRecipients\":[],\"BccRecipients\":[],\"Sensitivity\":\"Normal\",\"IsDeliveryReceiptRequested\":false,\"IsReadReceiptRequested\":false}],\"ClientSupportsIrm\":true,\"OutboundCharset\":\"AutoDetect\",\"MessageDisposition\":\"SendAndSaveCopy\",\"ComposeOperation\":\"newMail\"}}");
		writer.flush();
		writer.close();
		httpConn.getOutputStream().close();

		InputStream responseStream = httpConn.getResponseCode() / 100 == 2
				? httpConn.getInputStream()
				: httpConn.getErrorStream();
		if ("gzip".equals(httpConn.getContentEncoding())) {
			responseStream = new GZIPInputStream(responseStream);
		}
		Scanner s = new Scanner(responseStream).useDelimiter("\\A");
		String response = s.hasNext() ? s.next() : "";
		System.out.println(response);
	}
}
