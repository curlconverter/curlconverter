extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::Client::new()
        .post("http://example.com/post")
        .body("msg1=wow&msg2=such&msg3=@rawmsg")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
