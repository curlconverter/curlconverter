import fetch from 'node-fetch';
import HttpsProxyAgent from 'https-proxy-agent';

fetch('http://localhost:28139', {
  agent: new HttpsProxyAgent('http://localhost:8080')
});
