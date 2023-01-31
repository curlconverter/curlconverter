import 'package:http/http.dart' as http;

void main() async {
  var params = {
    'key': 'one',
    'key': 'two',
  };
  var query = params.entries.map((p) => '${p.key}=${p.value}').join('&');

  var url = Uri.parse('http://localhost:28139?$query');
  var res = await http.get(url);
  if (res.statusCode != 200) throw Exception('http.get error: statusCode= ${res.statusCode}');
  print(res.body);
}
