http --multipart \
  PATCH \
  :28139/patch \
  file1@./test/fixtures/curl_commands/delete.sh \
  form1=form+data+1 \
  form2=form_data_2
