import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('http://localhost:28139');

  final req = http.Request('wHat', url);

  final stream = await req.send();
  final res = await http.Response.fromStream(stream);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.send error: statusCode= $status');

  print(res.body);
}
