import 'package:http/http.dart' as http;

void main() async {
  final params = {
    'page': '1',
    'available': ['', '1'],
    'location': '0',
    'city[id]': '0',
    'city[locality]': '',
    'city[locality_text]': '',
    'city[administrative_area_level_2]': '',
    'city[administrative_area_level_2_text]': '',
    'city[administrative_area_level_1]': '',
    'city[administrative_area_level_1_text]': '',
    'city[country]': '',
    'city[country_text]': '',
    'city[latitude]': '',
    'city[longitude]': '',
    'city[zoom]': '',
    'city[name]': '',
    'region[id]': '0',
    'region[locality]': '',
    'region[locality_text]': '',
    'region[administrative_area_level_2]': '',
    'region[administrative_area_level_2_text]': '',
    'region[administrative_area_level_1]': '',
    'region[administrative_area_level_1_text]': '',
    'region[country]': '',
    'region[country_text]': '',
    'region[latitude]': '',
    'region[longitude]': '',
    'region[zoom]': '',
    'region[name]': '',
    'country': '',
    'environment': '',
    'population': '',
    'period': '0',
    'date': '2017-03-03',
    'datestart': '2017-03-03',
    'dateend': '2017-06-24',
    'season': '',
    'duration': '',
    'isfd': '',
    'stopover': '',
  };

  final url = Uri.parse('http://localhost:28139/house-sitting/')
      .replace(queryParameters: params);

  final res = await http.get(url);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.get error: statusCode= $status');

  print(res.body);
}
