#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;
use std::fs::File;
use std::path::Path;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct DataObj {
    #[serde(alias = "type")]
    the_type: Option<String>,
}
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct Args {
    data: Option<DataObj>,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct TraceData {
    args: Option<Args>,
    cat: Option<String>,
    name: Option<String>,
    ph: Option<String>,
    pid: Option<i64>,
    tid: Option<i64>,
    ts: Option<i64>,
    dur: Option<i64>,
}
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct Trace {
    #[serde(alias = "traceEvents")]
    trace_events: Vec<TraceData>,
}

fn main() {
    let json_file_path = Path::new("../trace.json");
    let json_file = File::open(json_file_path).expect("file not found");
    let start = Instant::now();
    let deserialized: Trace = serde_json::from_reader(json_file).expect("error while reading json");
    let mut duration: i64 = 0;
    let click_entry: Vec<&TraceData> = deserialized
        .trace_events
        .iter()
        .filter(|item| {
            if let Some(x) = item.args.as_ref().unwrap().data.clone() {
                if let Some(t) = x.the_type {
                    if t == "click" {
                        duration += item.dur.unwrap();
                        return true;
                    }
                }
            }
            if let Some(n) = item.name.clone() {
                if n == "Layout"
                    || n == "UpdateLayoutTree"
                    || n == "UpdateLayerTree"
                    || n == "Paint"
                {
                    duration += item.dur.unwrap();
                    return true;
                }
            }
            return false;
        })
        .collect();

    println!("{:?} {:?}ms", click_entry, duration / 1000);

    let elapsed = start.elapsed();
    println!("Elapsed: {:.2?}", elapsed);
}
