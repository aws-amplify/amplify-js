#!/bin/bash

# usage example: 
# ./retry-command.sh 3 publish:verdaccio

# initialize counter
n=0
# loop until n >= first param
until [ "$n" -ge $2 ]
do
	# $1 is the argument passed in, e.g. publish:verdaccio
	# if the publish command succeeds, `break` exits the loop
	yarn $1 && break
	
	if [[ $3 = 'git_reset' ]]
	then
	# reset git HEAD (remove the package.json changes made by lerna)
  	echo "Resetting git HEAD"
		git reset --hard
	fi
	
	# increment counter
	n=$((n+1))
	# wait 5 seconds
	sleep 5
	echo "Retry $n of $2"
done