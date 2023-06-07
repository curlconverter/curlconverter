import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('http://localhost:28139/patch');

  final req = http.MultipartRequest('PATCH', url)
    ..files.add(await http.MultipartFile.fromPath(
      'file1', './test/fixtures/curl_commands/delete.sh'));

  final stream = await req.send();
  final res = await http.Response.fromStream(stream);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.send error: statusCode= $status');

  print(res.body);
}
