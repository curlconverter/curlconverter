import axios from 'axios';

const params = new URLSearchParams();
params.append('page', '1');
params.append('available', '');
params.append('available', '1');
params.append('location', '0');
params.append('city[id]', '0');
params.append('city[locality]', '');
params.append('city[locality_text]', '');
params.append('city[administrative_area_level_2]', '');
params.append('city[administrative_area_level_2_text]', '');
params.append('city[administrative_area_level_1]', '');
params.append('city[administrative_area_level_1_text]', '');
params.append('city[country]', '');
params.append('city[country_text]', '');
params.append('city[latitude]', '');
params.append('city[longitude]', '');
params.append('city[zoom]', '');
params.append('city[name]', '');
params.append('region[id]', '0');
params.append('region[locality]', '');
params.append('region[locality_text]', '');
params.append('region[administrative_area_level_2]', '');
params.append('region[administrative_area_level_2_text]', '');
params.append('region[administrative_area_level_1]', '');
params.append('region[administrative_area_level_1_text]', '');
params.append('region[country]', '');
params.append('region[country_text]', '');
params.append('region[latitude]', '');
params.append('region[longitude]', '');
params.append('region[zoom]', '');
params.append('region[name]', '');
params.append('country', '');
params.append('environment', '');
params.append('population', '');
params.append('period', '0');
params.append('date', '2017-03-03');
params.append('datestart', '2017-03-03');
params.append('dateend', '2017-06-24');
params.append('season', '');
params.append('duration', '');
params.append('isfd', '');
params.append('stopover', '');

const response = await axios.get('http://localhost:28139/house-sitting/', {
  params: params
});
