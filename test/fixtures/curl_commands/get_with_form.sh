curl -s --user 'test' \
  http://localhost:28139/v3 \
  -F from='test@tester.com' \
  -F to='devs@tester.net' \
  -F subject='Hello' \
  -F text='Testing the converter!'
