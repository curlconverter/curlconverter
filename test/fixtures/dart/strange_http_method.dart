import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139');
  var res = await http.what(url);
  if (res.statusCode != 200) throw Exception('http.what error: statusCode= ${res.statusCode}');
  print(res.body);
}
