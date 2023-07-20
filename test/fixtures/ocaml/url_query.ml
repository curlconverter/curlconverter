open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139?foo=bar&baz=qux" in
Client.get uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
