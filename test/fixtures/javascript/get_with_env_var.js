fetch('http://localhost:28139/v2/images?type=distribution', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $DO_API_TOKEN'
  }
});
