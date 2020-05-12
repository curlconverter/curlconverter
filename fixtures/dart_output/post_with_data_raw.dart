import 'package:http/http.dart' as http;

void main() async {
  var data = 'msg1=wow&msg2=such&msg3=@rawmsg';

  var res = await http.post('http://example.com/post', body: data);
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
