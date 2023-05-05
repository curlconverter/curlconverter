http -a test: \
  --multipart \
  --quiet \
  :28139/v3 \
  from=test@tester.com \
  to=devs@tester.net \
  subject=Hello \
  text='Testing the converter!'
