// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * Publishes every non-private workspace package whose current package.json
 * version is not yet on the npm registry, using the npm CLI.
 *
 * This is the publish half of the v5 release (versioning is done by
 * `lerna version`). It uses the npm CLI rather than `lerna publish` because
 * only the npm CLI performs the npm trusted publishing (OIDC) token exchange.
 * When no OIDC identity is available, npm falls back to the token configured
 * in ~/.npmrc.
 *
 * Usage: node scripts/publish-from-package.js <dist-tag> [--dry-run]
 *
 * - Packages are published in topological order of their internal workspace
 *   dependencies, so a dependent never reaches the registry before the
 *   packages it pins.
 * - Versions already on the registry are skipped, so re-running is safe.
 * - Publishing stops at the first failure (fail fast): continuing would
 *   publish dependents of a package that never reached the registry. Re-run
 *   after fixing the cause; already-published packages are skipped.
 * - The registry is passed explicitly because `yarn run` sets
 *   npm_config_registry to the yarn registry, which npm cannot use for the
 *   trusted publishing exchange.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';
const DEPENDENCY_FIELDS = [
	'dependencies',
	'peerDependencies',
	'optionalDependencies',
	'devDependencies',
];

const rootDir = path.resolve(__dirname, '..');

function parseArgs(argv) {
	const args = argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const positional = args.filter(arg => !arg.startsWith('--'));
	if (positional.length !== 1) {
		console.error(
			'Usage: node scripts/publish-from-package.js <dist-tag> [--dry-run]'
		);
		process.exit(2);
	}
	return { distTag: positional[0], dryRun };
}

/**
 * Expands the root package.json `workspaces.packages` globs. Only simple
 * `dir/*` globs and literal directories are supported, which covers this
 * repository (`packages/*`).
 */
function getWorkspaceDirs() {
	const rootPkg = JSON.parse(
		fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
	);
	const workspaces = Array.isArray(rootPkg.workspaces)
		? rootPkg.workspaces
		: (rootPkg.workspaces && rootPkg.workspaces.packages) || [];
	const dirs = [];
	for (const pattern of workspaces) {
		if (pattern.endsWith('/*')) {
			const parent = path.join(rootDir, pattern.slice(0, -2));
			for (const entry of fs.readdirSync(parent).sort()) {
				dirs.push(path.join(parent, entry));
			}
		} else if (!pattern.includes('*')) {
			dirs.push(path.join(rootDir, pattern));
		} else {
			throw new Error(`Unsupported workspace glob: ${pattern}`);
		}
	}
	return dirs.filter(dir => fs.existsSync(path.join(dir, 'package.json')));
}

function loadPackages() {
	const packages = [];
	for (const dir of getWorkspaceDirs()) {
		const pkg = JSON.parse(
			fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
		);
		if (pkg.private) continue;
		packages.push({ name: pkg.name, version: pkg.version, dir, pkg });
	}
	return packages;
}

/**
 * Orders packages so that internal dependencies come first (Kahn's algorithm,
 * ties broken by name). Packages left in a cycle are appended in name order
 * with a warning rather than failing the release.
 */
function topologicalSort(packages) {
	const byName = new Map(packages.map(p => [p.name, p]));
	const deps = new Map();
	for (const p of packages) {
		const internal = new Set();
		for (const field of DEPENDENCY_FIELDS) {
			for (const dep of Object.keys(p.pkg[field] || {})) {
				if (dep !== p.name && byName.has(dep)) internal.add(dep);
			}
		}
		deps.set(p.name, internal);
	}

	const ordered = [];
	const remaining = new Set(byName.keys());
	while (remaining.size > 0) {
		const ready = [...remaining]
			.filter(name => [...deps.get(name)].every(d => !remaining.has(d)))
			.sort();
		if (ready.length === 0) {
			const cycle = [...remaining].sort();
			console.warn(
				`WARNING: dependency cycle between ${cycle.join(
					', '
				)}; publishing them in name order.`
			);
			ordered.push(...cycle);
			break;
		}
		for (const name of ready) {
			ordered.push(name);
			remaining.delete(name);
		}
	}
	return ordered.map(name => byName.get(name));
}

function getRegistry(p) {
	return (
		(p.pkg.publishConfig && p.pkg.publishConfig.registry) || DEFAULT_REGISTRY
	);
}

function isPublished(p) {
	try {
		const out = execFileSync(
			'npm',
			[
				'view',
				`${p.name}@${p.version}`,
				'version',
				'--registry',
				getRegistry(p),
			],
			{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
		);
		return out.trim() === p.version;
	} catch (error) {
		// A package that has never been published returns E404.
		if (/E404/.test(String(error.stderr))) return false;
		throw new Error(
			`npm view ${p.name}@${p.version} failed: ${error.stderr || error.message}`
		);
	}
}

function publish(p, distTag) {
	const publishConfig = p.pkg.publishConfig || {};
	const args = ['publish', '--tag', distTag, '--registry', getRegistry(p)];
	// Scoped packages default to restricted access; publish them publicly
	// unless the package states its own access level.
	if (p.name.startsWith('@') && !publishConfig.access) {
		args.push('--access', 'public');
	}
	// npm does not support publishConfig.directory; no package here uses it,
	// so refuse rather than publish the wrong directory.
	if (publishConfig.directory) {
		throw new Error(
			`${p.name}: publishConfig.directory is not supported by this script`
		);
	}
	execFileSync('npm', args, { cwd: p.dir, stdio: 'inherit' });
}

function main() {
	const { distTag, dryRun } = parseArgs(process.argv);
	const ordered = topologicalSort(loadPackages());

	console.log(
		`Publish order (${ordered.length} packages, dist-tag ${distTag}${
			dryRun ? ', dry run' : ''
		}):`
	);
	const pending = [];
	for (const p of ordered) {
		const published = isPublished(p);
		console.log(
			`  ${published ? 'SKIP   ' : 'PUBLISH'}  ${p.name}@${p.version}${
				published ? ' (already on registry)' : ''
			}`
		);
		if (!published) pending.push(p);
	}

	if (pending.length === 0) {
		console.log('Nothing to publish - the registry already matches the repo.');
		return;
	}
	if (dryRun) {
		console.log(
			`Dry run: ${pending.length} package(s) would be published; nothing was published.`
		);
		return;
	}

	const done = [];
	for (const p of pending) {
		console.log(`\nPublishing ${p.name}@${p.version} to ${distTag}`);
		try {
			publish(p, distTag);
			done.push(p);
		} catch (error) {
			console.error(`\nFailed to publish ${p.name}@${p.version}.`);
			console.error(
				`Published before the failure: ${
					done.map(d => `${d.name}@${d.version}`).join(', ') || '(none)'
				}`
			);
			console.error('Re-run to publish the remaining packages.');
			process.exit(1);
		}
	}
	console.log(`\nPublished ${done.length} package(s) to ${distTag}.`);
}

main();
