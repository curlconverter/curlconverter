import 'package:http/http.dart' as http;

void main() async {
  var res = await http.delete('http://www.url.com/page');
  if (res.statusCode != 200) throw Exception('delete error: statusCode= ${res.statusCode}');
  print(res.body);
}
