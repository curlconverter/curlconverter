response = HTTPoison.post! "http://localhost:28139/ajax/demo_post.asp",
  "",
  [
    {"Origin", "http://www.w3schools.com"},
    {"Accept-Encoding", "gzip, deflate"},
    {"Accept-Language", "en-US,en;q=0.8"},
    {"User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"},
    {"Accept", "*/*"},
    {"Referer", "http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511"},
    {"Connection", "keep-alive"},
    {"Content-Length", "0"}
  ],
  [hackney: [cookie: ["_gat=1; ASPSESSIONIDACCRDTDC=MCMDKFMBLLLHGKCGNMKNGPKI; _ga=GA1.2.1424920226.1419478126"]]]
