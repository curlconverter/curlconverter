$.ajax({
  url: 'http://localhost:28139',
  crossDomain: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'SimCity',
    'Referer': 'https://website.com'
  }
}).done(function(response) {
  console.log(response);
});
