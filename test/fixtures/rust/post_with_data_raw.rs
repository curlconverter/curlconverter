extern crate reqwest;
use reqwest::header;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("Content-Type", "application/x-www-form-urlencoded".parse().unwrap());

    let res = reqwest::Client::new()
        .post("http://localhost:28139/post")
        .headers(headers)
        .body("msg1=wow&msg2=such&msg3=@rawmsg")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
