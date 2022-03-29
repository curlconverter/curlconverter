extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::Client::new()
        .get("https://api.test.com/")
        .basic_auth("", Some("some_password"))
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
