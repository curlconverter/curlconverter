extern crate reqwest;

fn main() -> Result<(), reqwest::Error> {

    let res = reqwest::Client::new()
        .post("http://www.url.com/page")
        .body("a=b&c=d&e=f&h=i&j=k&l=m")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}