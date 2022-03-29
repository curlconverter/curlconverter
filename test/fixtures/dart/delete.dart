import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://www.url.com/page');
  var res = await http.delete(url);
  if (res.statusCode != 200) throw Exception('http.delete error: statusCode= ${res.statusCode}');
  print(res.body);
}
