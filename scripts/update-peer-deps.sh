# Updates the peer dependency version for all direct dependencies of aws-amplify
# Lerna does not automatically update peer dependency versions: https://github.com/lerna/lerna/issues/955
# This script runs with the version and prepublishOnly lifecycle events
# The script needs to run on both lifecycle events:
# 1. lerna increments version numbers
# 2. update-peer-deps.sh updates the peer deps to new version (version lifecycle event)
# 3. lerna creates release commit. i.e. chore(release) ...
# 4. lerna changes the peers deps back to old version (appears to bug in lerna)
# 5. update-peer-deps.sh updates the peer deps to new version again (prepublishOnly lifecycle event)
# 6. lerna publishes packages

NEW_VERSION=$(cat packages/aws-amplify/package.json | jq -r '.version')
lerna exec --scope=`cat packages/aws-amplify/package.json | jq -r '.dependencies | keys | join(" --scope=")'` -- \$LERNA_ROOT_PATH/scripts/update-peer-deps-for-package.sh $NEW_VERSION
