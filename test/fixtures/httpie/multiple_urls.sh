http PUT \
  :28139/file.txt \
  Content-Type:application/x-www-form-urlencoded \
  @file.txt


http PUT \
  :28139/myfile.jpg \
  Content-Type:application/x-www-form-urlencoded \
  "params==perurltoo" \
  @myfile.jpg


http --form \
  :28139 \
  Content-Type:application/x-www-form-urlencoded \
  "fooo=blah"


http --form \
  :28139 \
  Content-Type:application/x-www-form-urlencoded \
  "different=data" \
  "time=now"
