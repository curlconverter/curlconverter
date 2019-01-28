extern crate reqwest;
use reqwest::headers::*;

fn main() -> Result<(), reqwest::Error> {
    let mut headers = HeaderMap::new();
    headers.insert(X_MSISDN, "XXXXXXXXXXXXX".parse().unwrap());
    headers.insert(USER_AGENT, "Mozilla Android6.1".parse().unwrap());

    let res = reqwest::Client::new()
        .get("http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812")
        .headers(headers)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
