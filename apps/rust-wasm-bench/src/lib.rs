mod js;
use wasm_bindgen::prelude::*;
extern crate wee_alloc;
use crate::js::log;
use wasm_bindgen::JsCast;
use web_sys::HtmlElement;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");

    let root = document.get_element_by_id("root").unwrap();
    let header = document.create_element("header")?;
    let main = document.create_element("div")?;
    main.set_id("main");
    main.set_class_name("main");

    let h1 = document.create_element("h1")?;
    h1.set_inner_html("rust-wasm-bench");

    let k_button = document.create_element("button")?;
    k_button.set_id("create1000");
    k_button.set_inner_html("Create K");

    let create_k_closure =
        Closure::wrap(
            Box::new(move || create_table(1000).expect("couldn't execute k")) as Box<dyn FnMut()>,
        );
    k_button
        .dyn_ref::<HtmlElement>()
        .expect("k not there")
        .set_onclick(Some(create_k_closure.as_ref().unchecked_ref()));

    create_k_closure.forget();

    let ten_k_button = document.create_element("button")?;
    ten_k_button.set_id("create10000");
    ten_k_button.set_inner_html("Create 10K");

    let create_ten_k_closure =
        Closure::wrap(
            Box::new(move || create_table(10000).expect("couldn't execute ten k"))
                as Box<dyn FnMut()>,
        );
    ten_k_button
        .dyn_ref::<HtmlElement>()
        .expect("10k not there")
        .set_onclick(Some(create_ten_k_closure.as_ref().unchecked_ref()));

    create_ten_k_closure.forget();

    let clear_button = document.create_element("button")?;
    clear_button.set_id("clear");
    clear_button.set_inner_html("Clear");

    let clear_closure =
        Closure::wrap(
            Box::new(move || create_table(0).expect("couldn't execute clear")) as Box<dyn FnMut()>,
        );
    clear_button
        .dyn_ref::<HtmlElement>()
        .expect("Clear not there")
        .set_onclick(Some(clear_closure.as_ref().unchecked_ref()));

    clear_closure.forget();

    header.append_child(&h1)?;
    header.append_child(&k_button)?;
    header.append_child(&ten_k_button)?;
    header.append_child(&clear_button)?;
    main.append_child(&header)?;
    root.append_child(&main)?;

    Ok(())
}

fn create_table(rows: i32) -> Result<(), JsValue> {
    log("create table");
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let old_table = document.query_selector("table")?;

    match old_table {
        Some(x) => {
            x.parent_element().unwrap().remove_child(&x)?;
        }
        None => (),
    }

    if rows > 0 {
        let words = vec![
            "There",
            "High",
            "Lizards",
            "Sappy",
            "Wreck",
            "Fairly",
            "Barking",
            "Lurching",
            "Carbs",
            "Flat",
            "Hard",
            "Sad",
            "Butterfly",
            "Bandana",
        ];
        let table = document.create_element("table")?;
        let table_body = document.create_element("tbody")?;

        let root = document.get_element_by_id("main").unwrap();
        table.append_child(&table_body)?;
        root.append_child(&table)?;

        for n in 0..rows {
            let row = document.create_element("tr")?;
            let data_1 = document.create_element("td")?;
            let data_2 = document.create_element("td")?;

            // plus counter on both of these
            let t = match n {
                x if x > 14 => x,
                x if x <= 14 => x + 14,
                _ => 0,
            };
            let num = n + 1;
            let number_node = document.create_text_node(&num.to_string());
            let words_node = document.create_text_node(&format!(
                "{} {} {}",
                words[(t % 12) as usize],
                words[(t % 13) as usize],
                words[(t % 14) as usize]
            ));

            data_1.append_child(&number_node)?;
            data_2.append_child(&words_node)?;

            row.append_child(&data_1)?;
            row.append_child(&data_2)?;
            // This seems like it would be slower than just waiting to append to tbody after loop
            let tbody = document.query_selector("tbody")?;
            tbody.unwrap().append_child(&row)?;
        }
    }

    // counter += counter + 1;
    Ok(())
}
