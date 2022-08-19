import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/patch');
  var res = await http.MultipartRequest('PATCH', url)
    ..files.add(await http.MultipartFile.fromPath(
      'file1', './fixtures/curl_commands/delete.sh'))
    ..fields['form1'] = 'form+data+1'
    ..fields['form2'] = 'form_data_2'
  if (res.statusCode != 200) throw Exception('http.patch error: statusCode= ${res.statusCode}');
  print(res.body);
}
