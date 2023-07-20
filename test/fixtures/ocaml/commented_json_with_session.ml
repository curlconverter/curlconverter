open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139" in
let headers = Header.init ()
  |> fun h -> Header.add h "Content-Type" "application/json"
  |> fun h -> Header.add h "Accept" "application/json" in
let body = Cohttp_lwt.Body.of_string "{   }" in
Client.post ~headers ~body uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
