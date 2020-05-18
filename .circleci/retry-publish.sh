#!/bin/bash

n=0
until [ "$n" -ge 5 ]
do
	yarn $1 && break
	git reset --hard
	n=$((n+1))
	sleep 5
	echo "Retry $n of 5"
done