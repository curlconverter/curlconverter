#!/bin/bash
set -e
./node_modules/standard/bin/cmd.js index.js generators/*.js test.js *.js
./node_modules/tape/bin/tape test.js