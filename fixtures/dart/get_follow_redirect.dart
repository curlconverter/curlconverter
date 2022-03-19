import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://www.google.com');
  var res = await http.get(url);
  if (res.statusCode != 200) throw Exception('http.get error: statusCode= ${res.statusCode}');
  print(res.body);
}
