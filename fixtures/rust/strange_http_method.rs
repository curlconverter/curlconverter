extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::Client::new()
        .what("example.com")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
