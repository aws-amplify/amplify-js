# Called by scripts/update-peer-deps.sh
tmp=$(mktemp)
jq --arg NEW_VERSION "$1" '.peerDependencies["aws-amplify"] = $NEW_VERSION' package.json > "$tmp"
mv "$tmp" package.json
