import 'package:http/http.dart' as http;

void main() async {
  var params = {
    'page': '1',
    'available': '',
    'available': '1',
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
  var query = params.entries.map((p) => '${p.key}=${p.value}').join('&');

  var url = Uri.parse('https://localhost:28139/house-sitting/?$query');
  var res = await http.get(url);
  if (res.statusCode != 200) throw Exception('http.get error: statusCode= ${res.statusCode}');
  print(res.body);
}
