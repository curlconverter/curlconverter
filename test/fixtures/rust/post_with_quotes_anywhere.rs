extern crate reqwest;
use reqwest::header;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("A", "''a'".parse().unwrap());
    headers.insert("B", "\"".parse().unwrap());
    headers.insert(header::COOKIE, "x=1'; y=2\"".parse().unwrap());
    headers.insert("Content-Type", "application/x-www-form-urlencoded".parse().unwrap());

    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();
    let res = client.post("http://localhost:28139")
        .basic_auth("ol'", Some("asd\""))
        .headers(headers)
        .body("a=b&c=\"&d='")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
