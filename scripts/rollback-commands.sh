commit_number=$(
	git log --no-walk --tags --pretty="%H %d %s" --decorate=full |
	grep 'refs/tags/required-release' -n | cut -d \: -f 1
)

# When required-release is not in the current commits history, explain and fail out
if (( $commit_number <= 1 )); then
    echo "The required-release tag is not in the commit log. Please verify that rollback is possible before you continue";
	exit 1
fi

# Output the commands to update latest to the current version
git show HEAD -q |
	grep \- | # The lines with '-' output the versioned package names
	cut -d \  -f 7 | # The 6th ' ' is after the '-' in each line
	grep -v -e '^$' | # Ignore empty lines
	awk '{ printf("npm dist-tag add %s latest\n", $1) }' # Command to set `latest` to this version

create_deprecation_commands() {
	echo "\n\nDeprecation commands for $1:"
	git show $1 -q |
		grep \- | # The lines with '-' output the versioned package names
		cut -d \  -f 7 | # The 6th ' ' is after the '-' in each line
		grep -v -e '^$' | # Ignore empty lines
		awk '{ printf("npm deprecate %s  \"This version has been deprecated. Upgrade to @latest.\"\n", $1) }' # Command to set deprecate to this version
}

# Output the commands to deprecate all versions between the current version and release
for line in $(git rev-list --ancestry-path  HEAD...origin/release |
	xargs git show --pretty="%H %d %s" -q |
	grep 'tag: aws-amplify@' |
	cut -d \  -f 1 |
	grep -v -e '^$' # Ignore empty lines
); do
	create_deprecation_commands $line
done