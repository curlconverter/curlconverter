http -a USER:PASS \
  :28139/api/2.0/fo/auth/unix/ \
  X-Requested-With:curl \
  Content-Type:text/xml \
  "action==create" \
  "title==UnixRecord" \
  "username==root" \
  "password==abc123" \
  "ips==10.10.10.10" \
  @add_params.xml
