import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('http://localhost:28139/api/library');

  final req = http.MultipartRequest('POST', url)
    ..files.add(await http.MultipartFile.fromPath(
      'files', '47.htz'))
    ..fields['name'] = '47'
    ..fields['oldMediaId'] = '47'
    ..fields['updateInLayouts'] = '1'
    ..fields['deleteOldRevisions'] = '1';

  req.headers['accept'] = 'application/json';
  req.headers['Content-Type'] = 'multipart/form-data';

  final stream = await req.send();
  final res = await http.Response.fromStream(stream);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.send error: statusCode= $status');

  print(res.body);
}
