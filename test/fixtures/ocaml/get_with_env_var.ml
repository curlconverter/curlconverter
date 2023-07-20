open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/v2/images?type=distribution" in
let headers = Header.init ()
  |> fun h -> Header.add h "Content-Type" "application/json"
  |> fun h -> Header.add h "Authorization" ("Bearer " ^ (Sys.getenv "DO_API_TOKEN")) in
Client.get ~headers uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
