#!/bin/sh

[ ! -f node_modules/.bin/jake ] && npm install
node_modules/.bin/jake $*
