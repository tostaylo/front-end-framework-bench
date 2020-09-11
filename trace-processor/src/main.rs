#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;
use std::fs;
use std::fs::File;
use std::path::Path;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
struct TimingResult {
    timing_type: String,
    timing_framework: String,
    final_timing: TraceFileTimings,
}
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
    let directories = vec!["../traces/k/".to_owned(), "../traces/ten_k/".to_owned()];
    let trace_timing_results: Vec<TimingResult> = directories
        .iter()
        .map(|directory| {
            // Handle unwrapping no data here gracefully.
            // if path.nth(1)
            let mut paths = fs::read_dir(directory).unwrap();
            let path_entry = paths.nth(1).unwrap().expect("msg");
            let path_buf = path_entry.path();
            let path_str = path_buf.to_str().unwrap();
            let path_vec = path_str.split(".").collect::<Vec<&str>>();
            //if path_vec len greater than 4 or use nth instead for OK
            let current_framework = path_vec[path_vec.len() - 2].to_owned();
            let current_timing_type = path_vec[path_vec.len() - 3].to_owned();

            let timings: Vec<TraceFileTimings> = paths
                .map(|path| {
                    let path_entry = path.unwrap();
                    let path_buf = path_entry.path();

                    println!("Name: {}", path_buf.display());
                    let trace_file_timings =
                        calc_event_trace(get_trace_file(path_buf.to_str().unwrap()));
                    // fs::remove_file(path.to_str().unwrap()).expect("Could not remove file");
                    trace_file_timings
                })
                .collect();

            get_trace_timing_result(timings, current_timing_type, current_framework)
        })
        .collect();

    println!("k: {:?}", trace_timing_results);
    // Here we write to file or db?
    let elapsed = start.elapsed();
    println!("Elapsed: {:.2?}", elapsed);
}

fn get_trace_timing_result(
    mut timings: Vec<TraceFileTimings>,
    timing_type: String,
    timing_framework: String,
) -> TimingResult {
    timings.sort_by(|a, b| a.total_dur.cmp(&b.total_dur));
    timings.truncate(10);
    let k_trace_timing_total = timings.iter().fold(
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

    let final_timing = TraceFileTimings {
        total_dur: k_trace_timing_total.total_dur / 10,
        click_dur: k_trace_timing_total.click_dur / 10,
        render_during_click: k_trace_timing_total.render_during_click / 10,
        render_after_click: k_trace_timing_total.render_after_click / 10,
    };

    TimingResult {
        timing_type,
        timing_framework,
        final_timing,
    }
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
