#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;
use std::fs;
use std::fs::File;
use std::path::Path;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct TraceFileTimings {
    total_dur: i64,
    click_dur: i64,
    render_during_click: i64,
    render_after_click: i64,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct TraceDataObj {
    #[serde(alias = "type")]
    the_type: Option<String>,
}
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct TraceArgs {
    data: Option<TraceDataObj>,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct TraceData {
    args: Option<TraceArgs>,
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
    let start = Instant::now();

    let mut k_trace_timings: Vec<TraceFileTimings> = vec![];
    let k_paths = fs::read_dir("../trace/k/").unwrap();

    let mut ten_k_trace_timings: Vec<TraceFileTimings> = vec![];
    let ten_k_paths = fs::read_dir("../trace/ten_k/").unwrap();

    for path in k_paths {
        let p = path.unwrap();
        println!("Name: {}", p.path().display());
        k_trace_timings.push(calc_event_trace(get_trace_file(p.path().to_str().unwrap())));
        // fs::remove_file(p.path().to_str().unwrap()).expect("Could not remove file")
    }

    for path in ten_k_paths {
        let p = path.unwrap();
        println!("Name: {}", p.path().display());
        ten_k_trace_timings.push(calc_event_trace(get_trace_file(p.path().to_str().unwrap())));
        // fs::remove_file(p.path().to_str().unwrap()).expect("Could not remove file")
    }

    k_trace_timings.sort_by(|a, b| a.total_dur.cmp(&b.total_dur));
    k_trace_timings.truncate(10);
    let k_trace_timing_total = k_trace_timings.iter().fold(
        TraceFileTimings {
            total_dur: 0,
            click_dur: 0,
            render_during_click: 0,
            render_after_click: 0,
        },
        |acc, x| TraceFileTimings {
            total_dur: acc.total_dur + x.total_dur,
            click_dur: acc.click_dur + x.click_dur,
            render_during_click: acc.render_during_click + x.render_during_click,
            render_after_click: acc.render_after_click + x.render_after_click,
        },
    );

    let k_trace_timing_avg = TraceFileTimings {
        total_dur: k_trace_timing_total.total_dur / 10,
        click_dur: k_trace_timing_total.click_dur / 10,
        render_during_click: k_trace_timing_total.render_during_click / 10,
        render_after_click: k_trace_timing_total.render_after_click / 10,
    };

    println!("k: {:?}", k_trace_timing_avg);
    // println!("ten_k: {:?}", ten_k_trace_timings);

    let elapsed = start.elapsed();
    println!("Elapsed: {:.2?}", elapsed);
}

fn get_trace_file(path: &str) -> Trace {
    let json_file_path = Path::new(path);
    let json_file = File::open(json_file_path).expect("file not found");
    let deserialized: Trace = serde_json::from_reader(json_file).expect("error while reading json");
    deserialized
}

fn calc_event_trace(trace: Trace) -> TraceFileTimings {
    fn is_render_event(ev: &str) -> bool {
        ev == "Layout"
            || ev == "UpdateLayoutTree"
            || ev == "UpdateLayerTree"
            || ev == "Paint"
            || ev == "CompositeLayers"
    }

    let entries: Vec<TraceData> = trace
        .trace_events
        .iter()
        .filter(|item| {
            if let Some(x) = item.args.as_ref().unwrap().data.clone() {
                if let Some(t) = x.the_type {
                    if t == "click" {
                        return true;
                    }
                }
            }
            if let Some(n) = item.name.clone() {
                if is_render_event(&n) {
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

    let render_during_click = entries_during_click
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

    let render_after_click = entries_after_click
        .iter()
        .fold(0, |acc, x| acc + x.dur.unwrap());

    let click_dur = click.dur.unwrap();
    let total_dur = click_dur + render_during_click + render_after_click;

    println!(
        "Total duration is {:?} micros.
        Click duration is {:?} micros.
        Click time start is {:?} micros, 
        Click time end is {:?} micros,
        Rendering during click is {:?} micros,
        Rendering after click is {:?} micros,
          ",
        total_dur,
        click_dur,
        click_start_time,
        click_time_end,
        render_during_click,
        render_after_click
    );

    TraceFileTimings {
        total_dur,
        click_dur,
        render_during_click,
        render_after_click,
    }
}
