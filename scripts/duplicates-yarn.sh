#!/usr/bin/env bash

# This script detects duplicated Amplify dependencies in the dependency graph (with Yarn)
duplicatedDependencies=$(
	yarn list --pattern amplify | 
	grep -o -e '@\?aws-amplify[^ ]*' | 
	sort | uniq | 
	sed -E 's/^(@?[^@]+).*$/\1/g' | 
	uniq -d
)

if [ ! "$duplicatedDependencies" ]; then
	echo "No duplicated Amplify dependencies detected."
else
	echo "Duplicated Amplify dependencies detected: $duplicatedDependencies"
	false
fi
