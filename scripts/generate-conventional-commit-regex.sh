#!/bin/bash

# Get the list of directory names under ./packages
scopes=$(ls -d ./packages/*/ 2>/dev/null | xargs -n 1 basename | tr '\n' '|' | sed 's/|$//')

# Generate the regular expression
regex="^(feat|fix|docs|style|refactor|perf|test|chore|revert|release)(\(($scopes|required)\))?: .+$"

# Output the generated regex
echo "$regex";
