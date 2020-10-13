#!/bin/sh

set -ex

wasm-pack build --release --target web --out-name rust-wasm-bench
# http
# or could use python3 -m http.server
