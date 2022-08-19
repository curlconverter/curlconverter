import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/api/library');
  var req = new http.MultipartRequest('POST', url)
    ..files.add(await http.MultipartFile.fromPath(
      'files', '47.htz'))
    ..fields['name'] = '47'
    ..fields['oldMediaId'] = '47'
    ..fields['updateInLayouts'] = '1'
    ..fields['deleteOldRevisions'] = '1'
  req.headers['accept'] = 'application/json';
  req.headers['Content-Type'] = 'multipart/form-data';
  var res = await req.send();
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
