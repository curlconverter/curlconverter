open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139" in
let headers = Header.init ()
  |> fun h -> Header.add h "X-Requested-With" "XMLHttpRequest"
  |> fun h -> Header.add h "User-Agent" "SimCity"
  |> fun h -> Header.add h "Referer" "https://website.com" in
Client.get ~headers uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
