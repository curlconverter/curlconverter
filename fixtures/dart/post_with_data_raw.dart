import 'package:http/http.dart' as http;

void main() async {
  var data = 'msg1=wow&msg2=such&msg3=@rawmsg';

  var url = Uri.parse('http://example.com/post');
  var res = await http.post(url, body: data);
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
