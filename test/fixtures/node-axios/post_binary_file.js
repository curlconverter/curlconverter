import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/american-art/query',
  '@./sample.sparql',
  {
    headers: {
      'Content-type': 'application/sparql-query',
      'Accept': 'application/sparql-results+json'
    }
  }
);
