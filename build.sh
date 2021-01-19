#!/bin/sh

set -ex

npm run serve & 
# server_pid=$!
cd trace-generator
npm run tsc && node index.js 
# kill -KILL $server_pid
cd ../trace-processor 
cargo run &&
cd ../trace-results &&
cp meta.json trace-results.no-throttle.json trace-results.throttle-4x.json /Users/torre/Dev/front-end-framework-bench-landing/public
