open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/" in
let headers = Header.init ()
  |> fun h -> Header.add_authorization h (`Basic ("some_username", "some_password")) in
Client.get ~headers uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
