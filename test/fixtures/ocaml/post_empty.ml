open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139" in
let headers = Header.init_with "Content-Type" "application/x-www-form-urlencoded" in
let body = Cohttp_lwt.Body.of_string "" in
Client.post ~headers ~body uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
