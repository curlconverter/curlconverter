fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    let res = client.request("wHat", "http://localhost:28139")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
