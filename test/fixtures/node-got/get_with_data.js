import got from 'got';

const response = await got('http://localhost:28139/synthetics/api/v3/monitors', {
  searchParams: {
    'test': '2',
    'limit': '100',
    'w': '4'
  },
  headers: {
    'X-Api-Key': '123456789'
  }
});
