extern crate reqwest;
use reqwest::headers::*;

fn main() -> Result<(), reqwest::Error> {
    let mut headers = HeaderMap::new();
    headers.insert(A, "''a'".parse().unwrap());
    headers.insert(B, "\"".parse().unwrap());
    headers.insert(COOKIE, "x".parse().unwrap());
    headers.insert(COOKIE, "y".parse().unwrap());

    let res = reqwest::Client::new()
        .post("https://example.com")
        .basic_auth("ol'", Some("asd\""))
        .headers(headers)
        .body("a=b&c=\"&d='")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
