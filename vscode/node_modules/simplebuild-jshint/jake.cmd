@echo off
if not exist node_modules call npm install

node_modules\.bin\jake %*
