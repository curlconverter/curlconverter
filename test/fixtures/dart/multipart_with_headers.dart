import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('http://localhost:28139/api/2.0/files/content');

  final req = http.MultipartRequest('POST', url)
    ..fields['attributes'] = '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}'
    ..files.add(await http.MultipartFile.fromPath(
      'file', 'myfile.jpg'));

  req.headers['Authorization'] = 'Bearer ACCESS_TOKEN';
  req.headers['X-Nice'] = 'Header';

  final stream = await req.send();
  final res = await http.Response.fromStream(stream);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.send error: statusCode= $status');

  print(res.body);
}
