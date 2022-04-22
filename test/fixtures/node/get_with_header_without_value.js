import fetch from 'node-fetch';

fetch('localhost:28139/get', {
    headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'getWorkOrderCancel': ''
    }
});
