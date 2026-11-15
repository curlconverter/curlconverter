#include <curl/curl.h>

int main(int argc, char *argv[])
{
  CURLcode ret;
  CURL *hnd;
  curl_mime *mime1;
  curl_mimepart *part1;

  mime1 = NULL;

  hnd = curl_easy_init();
  curl_easy_setopt(hnd, CURLOPT_BUFFERSIZE, 102400L);
  curl_easy_setopt(hnd, CURLOPT_URL, "http://localhost:28139/upload");
  curl_easy_setopt(hnd, CURLOPT_NOPROGRESS, 1L);
  mime1 = curl_mime_init(hnd);
  part1 = curl_mime_addpart(mime1);
  curl_mime_data(part1, "value", CURL_ZERO_TERMINATED);
  curl_mime_name(part1, "name");
  curl_easy_setopt(hnd, CURLOPT_MIMEPOST, mime1);
  curl_easy_setopt(hnd, CURLOPT_USERAGENT, "curl/8.2.1");
  curl_easy_setopt(hnd, CURLOPT_MAXREDIRS, 50L);
  curl_easy_setopt(hnd, CURLOPT_HTTP_VERSION, (long)CURL_HTTP_VERSION_2TLS);
  curl_easy_setopt(hnd, CURLOPT_FTP_SKIP_PASV_IP, 1L);
  curl_easy_setopt(hnd, CURLOPT_TCP_KEEPALIVE, 1L);

  ret = curl_easy_perform(hnd);

  curl_easy_cleanup(hnd);
  hnd = NULL;
  curl_mime_free(mime1);
  mime1 = NULL;

  return (int)ret;
}
