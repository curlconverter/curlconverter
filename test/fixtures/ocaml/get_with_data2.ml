open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id" in
let headers = Header.init ()
  |> fun h -> Header.add h "X-Api-Key" "{admin_api_key}"
  |> fun h -> Header.add h "Content-Type" "application/json" in
Client.put ~headers uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
