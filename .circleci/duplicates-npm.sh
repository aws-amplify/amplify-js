#!/usr/bin/env bash

# This script detects duplicated Amplify dependencies in the dependency graph (with NPM)
duplicatedDependencies=$(
  npm ls -all 2>/dev/null | \
  grep -o -e '@\?aws-amplify[^ ]*' | \
  sort | uniq | \
  sed -E 's/^(@?[^@]+).*$/\1/g' | \
  uniq -d | sort
)

if [ ! "$duplicatedDependencies" ]; then
	echo "No duplicated Amplify dependencies detected."
else
	echo "Duplicated Amplify dependencies detected: $duplicatedDependencies"
	false
fi
