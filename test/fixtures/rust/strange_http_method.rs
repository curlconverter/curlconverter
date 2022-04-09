extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::Client::new()
        .what("localhost:28139")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
