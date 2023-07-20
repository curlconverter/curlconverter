open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139" in
let meth = Code.method_of_string "wHat" in
Client.call meth uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
