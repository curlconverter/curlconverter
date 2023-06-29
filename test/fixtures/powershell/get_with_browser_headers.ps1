$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$cookie = New-Object System.Net.Cookie
$cookie.Name = "GeoIP"
$cookie.Value = "US:Albuquerque:35.1241:-106.7675:v4"
$cookie.Domain = "localhost:28139"
$session.Cookies.Add($cookie)
$cookie = New-Object System.Net.Cookie
$cookie.Name = "uls-previous-languages"
$cookie.Value = "%5B%22en%22%5D"
$cookie.Domain = "localhost:28139"
$session.Cookies.Add($cookie)
$cookie = New-Object System.Net.Cookie
$cookie.Name = "mediaWiki.user.sessionId"
$cookie.Value = "VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y"
$cookie.Domain = "localhost:28139"
$session.Cookies.Add($cookie)
$cookie = New-Object System.Net.Cookie
$cookie.Name = "centralnotice_buckets_by_campaign"
$cookie.Value = "%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D"
$cookie.Domain = "localhost:28139"
$session.Cookies.Add($cookie)
$cookie = New-Object System.Net.Cookie
$cookie.Name = "centralnotice_bannercount_fr12"
$cookie.Value = "22"
$cookie.Domain = "localhost:28139"
$session.Cookies.Add($cookie)
$cookie = New-Object System.Net.Cookie
$cookie.Name = "centralnotice_bannercount_fr12-wait"
$cookie.Value = "14"
$cookie.Domain = "localhost:28139"
$session.Cookies.Add($cookie)
$headers = @{
    "Accept-Encoding" = "gzip, deflate, sdch"
    "Accept-Language" = "en-US,en;q=0.8"
    "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    "Referer" = "http://www.wikipedia.org/"
    "Connection" = "keep-alive"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/" `
    -WebSession $session `
    -Headers $headers `
    -UserAgent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
