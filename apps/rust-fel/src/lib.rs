mod handle;
mod main_component;
mod table;
use crate::main_component::Main;
use wasm_bindgen::prelude::*;
extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    let main = Main::create();
    let app = rust_fel::App::new(main);
    app.mount("root");

    Ok(())
}
