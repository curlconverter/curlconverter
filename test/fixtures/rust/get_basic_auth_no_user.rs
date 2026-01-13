fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    let res = client.get("http://localhost:28139/")
        .basic_auth("", Some("some_password"))
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
