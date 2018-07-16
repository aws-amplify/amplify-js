#!/bin/sh

[ ! -f node_modules/.bin/jake ] && echo "Installing NPM modules:" && npm install
node_modules/.bin/jake $*
