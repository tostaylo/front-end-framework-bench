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
    calc_event_trace(deserialized);
    let elapsed = start.elapsed();
    println!("Elapsed: {:.2?}", elapsed);
}

fn calc_event_trace(trace: Trace) {
    fn is_render_event(ev: &str) -> bool {
        ev == "Layout"
            || ev == "UpdateLayoutTree"
            || ev == "UpdateLayerTree"
            || ev == "Paint"
            || ev == "CompositeLayers"
    }
    let mut duration: i64 = 0;
    let entries: Vec<TraceData> = trace
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
                if is_render_event(&n) {
                    duration += item.dur.unwrap();
                    return true;
                }
            }
            return false;
        })
        .map(|item| item.to_owned())
        .collect();

    let click = entries
        .iter()
        .filter(|item| {
            if let Some(x) = item.args.as_ref().unwrap().data.clone() {
                if let Some(t) = x.the_type {
                    if t == "click" {
                        return true;
                    }
                }
            }

            return false;
        })
        .collect::<Vec<&TraceData>>()[0];
    let click_start_time = click.ts.unwrap();
    let click_time_end = click_start_time + click.dur.unwrap();

    let entries_during_click: Vec<&TraceData> = entries
        .iter()
        .filter(|item| {
            if let Some(n) = item.name.clone() {
                if is_render_event(&n) {
                    if item.ts.unwrap() >= click_start_time && item.ts.unwrap() <= click_time_end {
                        return true;
                    }
                }
            }
            return false;
        })
        .collect();

    let dur_of_entries_during_click = entries_during_click
        .iter()
        .fold(0, |acc, x| acc + x.dur.unwrap());

    let entries_after_click: Vec<&TraceData> = entries
        .iter()
        .filter(|item| {
            if let Some(n) = item.name.clone() {
                if is_render_event(&n) {
                    if item.ts.unwrap() > click_time_end {
                        return true;
                    }
                }
            }
            return false;
        })
        .collect();

    let dur_of_entries_after_click = entries_after_click
        .iter()
        .fold(0, |acc, x| acc + x.dur.unwrap());

    println!(
        "Total duration is {:?} micros. 
        Click duration is {:?} micros.
        Click time start is {:?} micros, 
        Click time end is {:?} micros,
        Rendering during click is {:?} micros,
        Rendering after click is {:?} micros,
          ",
        duration,
        click.dur.unwrap(),
        click.ts.unwrap(),
        click_time_end,
        dur_of_entries_during_click,
        dur_of_entries_after_click
    );
}
