#!/bin/sh

set -ex

python -m http.server 80  & 
server_pid=$!
cd trace-generator
npm run tsc && node index.js 
kill -KILL $server_pid
cd ../trace-processor 
cargo run

# no output in console
# &>/dev/null