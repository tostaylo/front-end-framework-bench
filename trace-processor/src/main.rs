#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;
use std::collections::HashMap;
use std::fs::File;
use std::path::Path;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug, Default)]
struct DataObj {
    #[serde(alias = "type")]
    the_type: Option<String>,
}
#[derive(Serialize, Deserialize, Debug, Default)]
struct Args {
    data: Option<DataObj>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
struct TraceData {
    args: Option<Args>,
    cat: String,
    name: String,
    ph: String,
    pid: i64,
    tid: i64,
    ts: i64,
}
#[derive(Serialize, Deserialize, Debug, Default)]
struct Trace {
    traceEvents: Vec<TraceData>,
}

fn main() {
    let json_file_path = Path::new("../trace.json");
    let json_file = File::open(json_file_path).expect("file not found");
    let start = Instant::now();
    let deserialized: Trace = serde_json::from_reader(json_file).expect("error while reading json");
    for trace_data in deserialized.traceEvents {
        if let Some(x) = trace_data.args.unwrap().data {
            if let Some(t) = x.the_type {
                println!("{:?}", t);
            }
        }
    }

    let elapsed = start.elapsed();
    println!("Elapsed: {:.2?}", elapsed);
}
