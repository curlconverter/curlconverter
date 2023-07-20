open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4" in
let headers = Header.init_with "X-Api-Key" "123456789" in
Client.get ~headers uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
