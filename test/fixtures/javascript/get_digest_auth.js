import * as DigestFetch from 'digest-fetch';

client = new DigestFetch('some_username', 'some_password');
client.fetch('http://localhost:28139/');
