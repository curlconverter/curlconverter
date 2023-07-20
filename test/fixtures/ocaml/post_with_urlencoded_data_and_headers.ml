open Lwt
open Cohttp
open Cohttp_lwt_unix

let uri = Uri.of_string "http://localhost:28139/api/Listing.svc/PropertySearch_Post" in
let headers = Header.init ()
  |> fun h -> Header.add h "Origin" "http://www.realtor.ca"
  |> fun h -> Header.add h "Accept-Encoding" "gzip, deflate"
  |> fun h -> Header.add h "Accept-Language" "en-US,en;q=0.8"
  |> fun h -> Header.add h "User-Agent" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36"
  |> fun h -> Header.add h "Content-Type" "application/x-www-form-urlencoded; charset=UTF-8"
  |> fun h -> Header.add h "Accept" "*/*"
  |> fun h -> Header.add h "Referer" "http://www.realtor.ca/Residential/Map.aspx"
  |> fun h -> Header.add h "Connection" "keep-alive" in
let body = Cohttp_lwt.Body.of_string "CultureId=1&ApplicationId=1&RecordsPerPage=200&MaximumResults=200&PropertyTypeId=300&TransactionTypeId=2&StoreyRange=0-0&BuildingTypeId=1&BedRange=0-0&BathRange=0-0&LongitudeMin=-79.3676805496215&LongitudeMax=-79.27300930023185&LatitudeMin=43.660358732823845&LatitudeMax=43.692390574029936&SortOrder=A&SortBy=1&viewState=m&Longitude=-79.4107246398925&Latitude=43.6552047278685&ZoomLevel=13&CurrentPage=1" in
Client.post ~headers ~body uri
>>= fun (resp, body) ->
  (* Do stuff with the result *)
