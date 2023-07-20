open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/echo/html/" in
let headers = Header.init ()
  |> fun h -> Header.add h "Origin" "http://fiddle.jshell.net"
  |> fun h -> Header.add h "Accept-Encoding" "gzip, deflate"
  |> fun h -> Header.add h "Accept-Language" "en-US,en;q=0.8"
  |> fun h -> Header.add h "User-Agent" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
  |> fun h -> Header.add h "Content-Type" "application/x-www-form-urlencoded; charset=UTF-8"
  |> fun h -> Header.add h "Accept" "*/*"
  |> fun h -> Header.add h "Referer" "http://fiddle.jshell.net/_display/"
  |> fun h -> Header.add h "X-Requested-With" "XMLHttpRequest"
  |> fun h -> Header.add h "Connection" "keep-alive" in
let body = Cohttp_lwt.Body.of_string "msg1=wow&msg2=such" in
Client.post ~headers ~body uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
