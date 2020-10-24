mod js;
use wasm_bindgen::prelude::*;
extern crate wee_alloc;
use js_sys::Reflect;
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

    let update_button = document.create_element("button")?;
    update_button.set_id("update");
    update_button.set_inner_html("Update");
    let update_closure =
        Closure::wrap(
            Box::new(move || update_table_data().expect("couldn't execute clear"))
                as Box<dyn FnMut()>,
        );
    update_button
        .dyn_ref::<HtmlElement>()
        .expect("Update")
        .set_onclick(Some(update_closure.as_ref().unchecked_ref()));

    update_closure.forget();

    header.append_child(&h1)?;
    header.append_child(&k_button)?;
    header.append_child(&ten_k_button)?;
    header.append_child(&clear_button)?;
    header.append_child(&update_button)?;
    main.append_child(&header)?;
    root.append_child(&main)?;

    Ok(())
}

fn create_table(rows: i32) -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");

    let counter = match Reflect::get(&window, &JsValue::from_str("varTracker")) {
        Ok(value) if Ok(true) == Reflect::has(&value, &JsValue::from_str("setCounter")) => {
            let x: &js::VarTracker = value.unchecked_ref();
            x.setCounter();
            x.setRows(rows);
            x.getCounter()
        }
        _ => {
            panic!("Could not get varTracker from window.");
        }
    };

    match document.get_element_by_id("table") {
        Some(x) => {
            x.parent_element().unwrap().remove_child(&x)?;
        }
        None => (),
    };

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
        table.set_id("table");

        let table_body = document.create_element("tbody")?;

        for n in 1..rows + 1 {
            let row = document.create_element("tr")?;
            let data_1 = document.create_element("td")?;
            let data_2 = document.create_element("td")?;
            data_2.set_id(&format!("td{}", n));

            let t = match n {
                x if x > 14 => x + counter,
                x if x <= 14 => x + 14 + counter,
                _ => 0,
            };
            let num = n;
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

            table_body.append_child(&row)?;
        }

        let root = document.get_element_by_id("main").unwrap();
        table.append_child(&table_body)?;
        root.append_child(&table)?;
    }

    Ok(())
}

fn update_table_data() -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let rows = match Reflect::get(&window, &JsValue::from_str("varTracker")) {
        Ok(value) if Ok(true) == Reflect::has(&value, &JsValue::from_str("setCounter")) => {
            let x: &js::VarTracker = value.unchecked_ref();
            x.setCounter();
            x.getRows()
        }
        _ => {
            panic!("Could not get varTracker from window.");
        }
    };

    for row_num in 1..rows + 1 {
        if row_num % 10 == 0 {
            document
                .get_element_by_id(&format!("td{}", row_num))
                .unwrap()
                .set_text_content(Some("We are updated"));
        }
    }
    Ok(())
}
