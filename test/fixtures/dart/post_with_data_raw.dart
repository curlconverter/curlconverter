import 'package:http/http.dart' as http;

void main() async {
  final headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  final data = 'msg1=wow&msg2=such&msg3=@rawmsg';

  final url = Uri.parse('http://localhost:28139/post');

  final res = await http.post(url, headers: headers, body: data);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.post error: statusCode= $status');

  print(res.body);
}
