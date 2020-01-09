extern crate reqwest;
use reqwest::header;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("A", "''a'".parse().unwrap());
    headers.insert("B", "\"".parse().unwrap());
    headers.insert(header::COOKIE, "x=1'; y=2\"".parse().unwrap());

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
