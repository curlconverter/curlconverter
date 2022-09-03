import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/patch');
  var res = await http.MultipartRequest('PATCH', url)
    ..files.add(await http.MultipartFile.fromPath(
      'file1', './test/fixtures/curl_commands/delete.sh'))
  if (res.statusCode != 200) throw Exception('http.patch error: statusCode= ${res.statusCode}');
  print(res.body);
}
