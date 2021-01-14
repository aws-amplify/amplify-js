# Status Check Action

This action creates & updates a status check for the current commit.

## Usage

### Manually

```shell
GITHUB_REPOSITORY=aws-amplify/amplify-js \
GITHUB_TOKEN=... \
CONTEXT="My Status check" \
DESCRIPTION="± 5kB" \
STATE=success \
node index.js
```

### GitHub Action

```
- name: Finished check
	uses: ./.github/actions/status-check-actions
	with:
		state: success
		context: PR stats for ${{ matrix.stack }}
```
