import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('http://localhost:28139/page');

  final res = await http.delete(url);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.delete error: statusCode= $status');

  print(res.body);
}
