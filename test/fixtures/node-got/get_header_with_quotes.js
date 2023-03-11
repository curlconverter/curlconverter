import got from 'got';

const response = await got('http://localhost:28139', {
  headers: {
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="92"'
  }
});
