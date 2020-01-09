extern crate reqwest;
use reqwest::header;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("x-msisdn", "XXXXXXXXXXXXX".parse().unwrap());
    headers.insert("User-Agent", "Mozilla Android6.1".parse().unwrap());

    let res = reqwest::Client::new()
        .get("http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812")
        .headers(headers)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
