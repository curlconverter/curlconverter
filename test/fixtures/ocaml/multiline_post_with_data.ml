open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/echo/html/" in
let headers = Header.init ()
  |> fun h -> Header.add h "Origin" "http://fiddle.jshell.net"
  |> fun h -> Header.add h "Content-Type" "application/x-www-form-urlencoded" in
let body = Cohttp_lwt.Body.of_string "msg1=value1&msg2=value2" in
Client.call ~headers ~body `GET uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
