#!/bin/sh

set -ex

python -m http.server 80  & 
server_pid=$!
cd trace-generator
npm run tsc && node index.js 
kill -KILL $server_pid
cd ../trace-processor 
cargo run &&
cd ../trace-results &&
cp trace-results.no-throttle.json trace-results.throttle-4x.json /Users/torre/Dev/e28/p3/public

# no output in console
# &>/dev/null