import axios from 'axios';

const response = await axios.get('http://localhost:28139/vc/moviesmagic', {
  params: {
    'p': '5',
    'pub': 'testmovie',
    'tkn': '817263812'
  },
  headers: {
    'x-msisdn': 'XXXXXXXXXXXXX',
    'user-agent': 'Mozilla Android6.1'
  }
});
