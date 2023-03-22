wget --header="accept: application/json" \
  --header="Cookie: mysamplecookie=someValue; emptycookie=; otherCookie=2" \
  --output-document - \
  http://localhost:28139/cookies
