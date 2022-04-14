# Status Check Action

This action creates & updates a status check for the current commit.

Your `GITHUB_TOKEN` will need `public_repo, repo:status` permissions.

**Note that `${{ secrets.GITHUB_TOKEN }}` is **read-only** for forks**: https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow#permissions-for-the-github_token

## Usage

### Manually

```shell
CONTEXT="My Status check" \
DESCRIPTION="± 5kB" \
GITHUB_TOKEN=... \
GITHUB_REPOSITORY=aws-amplify/amplify-js \
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

## Prior Art

- https://github.com/Sibz/github-status-action
- https://github.com/mitchheddles/github-action-status-check
