mod handle;
mod table;
//mod js;
mod main_component;
use crate::main_component::Main;
use wasm_bindgen::prelude::*;
//extern crate console_error_panic_hook;
extern crate rust_fel;

extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    //console_error_panic_hook::set_once();
    let main = Main::create();
    let app = rust_fel::App::new(main);
    app.mount("root");

    Ok(())
}
