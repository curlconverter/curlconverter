extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::new();
    let res = client.get("https://localhost:28139/")
        .basic_auth("some_username", Some("some_password"))
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
