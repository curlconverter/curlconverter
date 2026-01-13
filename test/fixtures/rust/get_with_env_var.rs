use reqwest::header;
use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse()?);
    headers.insert("Authorization", ["Bearer ", env::var("DO_API_TOKEN").unwrap_or("")].concat().parse()?);

    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    let res = client.get("http://localhost:28139/v2/images?type=distribution")
        .headers(headers)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
