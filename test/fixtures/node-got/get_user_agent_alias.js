import got from 'got';

const response = await got('http://localhost:28139/vc/moviesmagic', {
  searchParams: {
    'p': '5',
    'pub': 'testmovie',
    'tkn': '817263812'
  },
  headers: {
    'x-msisdn': 'XXXXXXXXXXXXX',
    'user-agent': 'Mozilla Android6.1'
  }
});
