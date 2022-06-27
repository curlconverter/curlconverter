extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::blocking::Client::new()
        .what("http://localhost:28139")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
