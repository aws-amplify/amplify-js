import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

function assert(message) {
	throw new Error(message);
}

const {
	CONTEXT,
	DESCRIPTION,
	OWNER = assert('Missing OWNER'),
	REPOSITORY = assert('Missing REPOSITORY'),
	SHA = execSync('git rev-parse head')
		.toString()
		.trim(),
	GITHUB_TOKEN = assert('Missing GITHUB_TOKEN'),
	STATE = 'pending',
} = process.env;

const { repos } = new Octokit({
	auth: GITHUB_TOKEN,
	userAgent: 'status-check-action',
	baseUrl: 'https://api.github.com',
	log: {
		debug: console.debug,
		error: console.error,
		info: console.info,
		warn: console.warn,
	},
	request: {
		agent: undefined,
		fetch: undefined,
		timeout: 0,
	},
});

await repos.createCommitStatus({
	context: CONTEXT,
	description: DESCRIPTION,
	state: STATE,
	owner: OWNER,
	repo: REPOSITORY,
	sha: SHA,
});
