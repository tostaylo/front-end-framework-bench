use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

#[wasm_bindgen(module = "/varTracker.js")]
extern "C" {
    pub type VarTracker;

    // #[wasm_bindgen(constructor)]
    // fn new(msg: &str, recipient: &str) -> Greeting;

    #[wasm_bindgen(method)]
    pub fn setCounter(this: &VarTracker);

    #[wasm_bindgen(method)]
    pub fn setRows(this: &VarTracker, rows: i32);

    #[wasm_bindgen(method)]
    pub fn getRows(this: &VarTracker) -> i32;

    #[wasm_bindgen(method)]
    pub fn getCounter(this: &VarTracker) -> i32;
}
