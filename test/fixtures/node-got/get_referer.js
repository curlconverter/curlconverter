import got from 'got';

const response = await got('http://localhost:28139', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'SimCity',
    'Referer': 'https://website.com'
  }
});
