import got from 'got';

const response = await got('http://localhost:28139/v2/images', {
  searchParams: {
    'type': 'distribution'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env['DO_API_TOKEN']
  }
});
