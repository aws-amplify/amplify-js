#!/bin/bash

# flags:
# -s = script name
# -n = how many times to retry
# -r (optional) = run git reset in between retries

# usage example: 
# ./retry-command.sh -s lint -n 5
# ./retry-command.sh -s publish:verdaccio -n 3 -r true

while getopts s:n:r: option
do
	case "${option}"
	in
		s) SCRIPT=${OPTARG};;
		n) N=${OPTARG};;
		r) GIT_RESET=${OPTARG};;
	esac
done

# initialize counter
n=0
# loop until n > first param
until [ "$n" -gt $N ]
do
	# $1 is the argument passed in, e.g. publish:verdaccio
	# if the publish command succeeds, `break` exits the loop
	yarn $SCRIPT && break
	
	if [[ $GIT_RESET ]]
	then
	# reset git HEAD (remove the package.json changes made by lerna)
  	echo "Resetting git HEAD"
		git reset --hard
	fi

	if [ "$n" -eq $N ]; 
	then
		echo "Returning error"
		exit 1
	fi

	# increment counter
	n=$((n+1))
	
	# wait 5 seconds
	sleep 5
	echo "Retry $n of $N"
done
