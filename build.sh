#!/bin/sh

set -ex

http &>/dev/null &
npm run tsc && node index.js && fg
cd trace-processor 
cargo run
