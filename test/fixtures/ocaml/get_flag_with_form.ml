open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/upload" in
Client.post uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
