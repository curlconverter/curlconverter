import 'package:http/http.dart' as http;

void main() async {
  final headers = {
    'foo': 'bar',
  };

  final url = Uri.parse('http://localhost:28139/');

  final res = await http.get(url, headers: headers);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.get error: statusCode= $status');

  print(res.body);
}
