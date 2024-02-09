#!/usr/bin/env bash

# This script sets the `@aws-amplify/core` peer dependency version when the library is being published with a 
# `preid` version.
#
# By design, Lerna does not update peer dependencies on packages vended by the monorepo as it would defeat the efficacy
# of having peer dependencies in the first place (which indicate a range of compatible versions). This script enables
# us to effectively test the library by pinning the peer dependency version of `@aws-amplify/core` across the library
# to the version being published. This script will not be executed for production releases, which do not specify a
# `preid`.
#
# @remarks
# This script is to be executed after versions have been set but before publication to NPM, e.g. the NPM `prepare`
# life-cycle script which Lerna will invoke. It will set the peer-dependency in each category's package.json file 
# before it gets packaged up and sent to NPM.
#
# @remarks
# This script requires `jq` which is installed by default on Linux. On OSX use `brew install jq`.

PACKAGE_DIR=packages
UMBRELLA_PACKAGE_JSON=${PACKAGE_DIR}/aws-amplify/package.json
CORE_PACKAGE_JSON=${PACKAGE_DIR}/core/package.json
LOG_PREFIX="[preid preparation]"
PRE_ID_REGEX='.*-(.*)\.'

# Step 1: Grab the version of `aws-amplify` & determine if a pre-release ID is in use
libraryVersion=$(jq '.version' $UMBRELLA_PACKAGE_JSON | tr -d \")

echo "$LOG_PREFIX aws-amplify version: $libraryVersion"

if [[ $libraryVersion =~ $PRE_ID_REGEX ]]; then
	echo "$LOG_PREFIX Pre-release ID in use: ${BASH_REMATCH[1]}"
else 
	echo "$LOG_PREFIX Pre-release ID NOT in use, exiting."
	exit 0;
fi

# Step 2: Grab the version of `@aws-amplify/core`
coreVersion=$(jq '.version' $CORE_PACKAGE_JSON | tr -d \")
echo "$LOG_PREFIX @aws-amplify/core version: $coreVersion"

# Step 3: Set the `@aws-amplify/core` peer dependency version across the library ahead of publication
for packageFile in $PACKAGE_DIR/*/package.json; do
	peerDepExistsInFile=$(jq '.peerDependencies | has("@aws-amplify/core")' $packageFile)

	# Skip private packages as they won't be published
	privateFlag=$(jq '.private' $packageFile)
	[[ "$privateFlag" == "true" ]] && packageIsPrivate=true || packageIsPrivate=false
  
	if [ $packageIsPrivate != true ] && [ $peerDepExistsInFile == true ]
	then
		# Set the peer dependency & write back to the package's package.json file
		jq --arg version "$coreVersion" '.peerDependencies."@aws-amplify/core" = $version' $packageFile > $packageFile.tmp && mv $packageFile.tmp $packageFile

		echo "$LOG_PREFIX Set peer dependency version in: ${packageFile}"
	fi
done 

# Step 4: Set the `aws-amplify` peer dependency version across the library ahead of publication
for packageFile in $PACKAGE_DIR/*/package.json; do
	peerDepExistsInFile=$(jq '.peerDependencies | has("aws-amplify")' $packageFile)

	# Skip private packages as they won't be published
	privateFlag=$(jq '.private' $packageFile)
	[[ "$privateFlag" == "true" ]] && packageIsPrivate=true || packageIsPrivate=false
  
	if [ $packageIsPrivate != true ] && [ $peerDepExistsInFile == true ]
	then
		# Set the peer dependency & write back to the package's package.json file
		jq --arg version "$libraryVersion" '.peerDependencies."aws-amplify" = $version' $packageFile > $packageFile.tmp && mv $packageFile.tmp $packageFile

		echo "$LOG_PREFIX Set peer dependency version in: ${packageFile}"
	fi
done 

echo "$LOG_PREFIX ✅ Completed successfully!"
