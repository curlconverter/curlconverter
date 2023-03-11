import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';

fetch('http://localhost:28139', {
  agent: new SocksProxyAgent('socks://1.1.1.1:8888')
});
