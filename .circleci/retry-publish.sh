#!/bin/bash

# initialize counter
n=0
# loop until n >= 5
until [ "$n" -ge 5 ]
do
	# $1 is the argument passed in, e.g. publish:verdaccio
	# if the publish command succeeds, `break` exits the loop
	yarn $1 && break
	# if the command fails
	# reset git HEAD (remove the package.json changes made by lerna)
	git reset --hard
	# increment counter
	n=$((n+1))
	# wait 5 seconds
	sleep 5
	echo "Retry $n of 5"
done