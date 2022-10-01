extern crate reqwest;
use reqwest::header;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("Content-Type", "application/x-www-form-urlencoded".parse().unwrap());

    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();
    let res = client.post("http://localhost:28139/post")
        .headers(headers)
        .body("msg1=wow&msg2=such&msg3=@rawmsg")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
