extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::new();
    let res = client.get("http://localhost:28139")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
