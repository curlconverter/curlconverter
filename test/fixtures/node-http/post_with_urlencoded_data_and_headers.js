import http from 'http';

const options = {
  hostname: 'localhost:28139',
  path: '/api/Listing.svc/PropertySearch_Post',
  method: 'POST',
  headers: {
    'Origin': 'http://www.realtor.ca',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'Referer': 'http://www.realtor.ca/Residential/Map.aspx',
    'Connection': 'keep-alive'
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(new URLSearchParams({
  'CultureId': '1',
  'ApplicationId': '1',
  'RecordsPerPage': '200',
  'MaximumResults': '200',
  'PropertyTypeId': '300',
  'TransactionTypeId': '2',
  'StoreyRange': '0-0',
  'BuildingTypeId': '1',
  'BedRange': '0-0',
  'BathRange': '0-0',
  'LongitudeMin': '-79.3676805496215',
  'LongitudeMax': '-79.27300930023185',
  'LatitudeMin': '43.660358732823845',
  'LatitudeMax': '43.692390574029936',
  'SortOrder': 'A',
  'SortBy': '1',
  'viewState': 'm',
  'Longitude': '-79.4107246398925',
  'Latitude': '43.6552047278685',
  'ZoomLevel': '13',
  'CurrentPage': '1'
}).toString());
req.end();
