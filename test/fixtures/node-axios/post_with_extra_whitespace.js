const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('files', fs.readFileSync('47.htz'), '47.htz');
formData.append('name', '47');
formData.append('oldMediaId', '47');
formData.append('updateInLayouts', '1');
formData.append('deleteOldRevisions', '1');

const response = await axios.post(
    'http://localhost:28139/api/library',
    formData,
    {
        headers: {
            ...formData.getHeaders(),
            'accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
    }
);
