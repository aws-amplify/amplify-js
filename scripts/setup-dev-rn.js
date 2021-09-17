'use strict';

const path = require('path');
const yargs = require('yargs');
const { exec } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const os = require('os');
const winston = require('winston');
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : 'info',
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.prettyPrint(2),
				winston.format.colorize({ all: true })
			),
		}),
	],
});

function setupDevReactNative() {
	const args = yargs.argv;
	const dependentAppPath = args.target ?? args.t;
	const packages = args.packages ?? args.p;
	const pkgRootPath = process.cwd();

	// Exit if package option is not given
	if (packages === undefined || packages === true) {
		logger.error('Package option cannot be empty.');
		return;
	}

	// Exit if dependent app option is not given
	if (dependentAppPath === undefined || dependentAppPath === true) {
		logger.error('Target App path cannot be empty.');
		return;
	}

	// Exit if dependent app path is given but does not exist
	if (!existsSync(dependentAppPath)) {
		logger.error(
			'Dependent app path given does not exist. Please provide a valid path'
		);
		return;
	}

	// Exit for unsupported OS
	if (os.platform() !== 'darwin') {
		logger.error(
			'No support for this operating system. Currently only supports OSX.'
		);
		return;
	}

	// Remove packages that do not have build:watch script
	const excludedPacks = [
		'aws-amplify-vue',
		'@aws-amplify/ui',
		'@aws-amplify/ui-vue',
		'@aws-amplify/ui-angular',
		'@aws-amplify/ui-components',
		'@aws-amplify/ui-storybook',
		'aws-amplify-angular',
	];

	// Exclude unrelated packages
	const supportedPacks = getPackageNames('./packages/').filter(
		el => !excludedPacks.includes(el)
	);

	// ALL Packages list formation
	const packagesArr = packages === 'all' ? supportedPacks : packages.split(',');

	const cjsPacksPreset = [
		'aws-amplify-react-native',
		'@aws-amplify/pushnotification',
		'@aws-amplify/ui',
	];
	const esmPackages = [];
	const cjsPackages = [];

	packagesArr.forEach(element => {
		if (!supportedPacks.includes(element)) {
			logger.error(
				`Package ${element} is not supported by this script or does not exist. Here is list of supported packages: ${supportedPacks}`
			);
			process.exit(0);
		}

		// Divide the packagesArr into cjs and esm packages
		if (!cjsPacksPreset.includes(element)) {
			esmPackages.push(element);
		} else {
			cjsPackages.push(element);
		}
	});

	const finalCmds = [];

	// LERNA build:ESM:watch command with scopes for multiple or all packages
	if (esmPackages.length > 0) {
		const scopes = `{${esmPackages.join(',')},}`;
		const watchCmd = `npx lerna exec --scope=${scopes} npm run build:esm:watch --parallel`;
		const lernaBuildWatchCmd = `cd ${pkgRootPath} && ${watchCmd}`;
		finalCmds.push(lernaBuildWatchCmd);
	}

	// WML add command formation
	const wmlClearCmd = 'npm-exec wml rm all && ';
	const wmlAddCmd = buildWmlAddStrings(
		packagesArr,
		dependentAppPath,
		pkgRootPath
	);
	const wmlStart = 'npm-exec wml start';
	const navToDirAndAlias = `cd ${pkgRootPath} && alias npm-exec='PATH=$(npm bin):$PATH'`;
	const finalWmlCmd = `${navToDirAndAlias} & ${wmlClearCmd} ${wmlAddCmd} ${wmlStart}`;

	finalCmds.push(finalWmlCmd);

	// LERNA build:CJS:watch package command to be run in a new tab
	if (cjsPackages.length > 0) {
		const cjsPackagesBuildWatch = `cd ${pkgRootPath} && npx lerna exec --scope={${cjsPackages.join(
			','
		)},} npm run build:cjs:watch --parallel`;
		finalCmds.push(cjsPackagesBuildWatch);
	}

	// Open each command in a new tab in a new terminal
	openTab(finalCmds);
}

// Convert scoped packagenames to directory names used for path formation for wml commands
const scopeToDirectoryName = scopedPackages =>
	scopedPackages.map(scoPackage => {
		const packageName = scoPackage.split('/')[1] ?? scoPackage;
		return packageName.includes('ui') ? `amplify-${packageName}` : packageName;
	});

// Get all package names from under the packages directory
const getPackageNames = source =>
	readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => require(`../packages/${dirent.name}/package.json`).name);

// Form all the wml add commands needed
function buildWmlAddStrings(packages, dependentAppPath, pkgRootPath) {
	let wmlAddCmds = [];
	const packagesDir = path.resolve(pkgRootPath, 'packages');
	const sampleAppNodeModulesDir = path.join(dependentAppPath, 'node_modules');

	packages.forEach(element => {
		const source = path.resolve(
			packagesDir,
			scopeToDirectoryName([element])[0]
		);
		const target = path.resolve(sampleAppNodeModulesDir, element);
		wmlAddCmds.push(` npm-exec wml add ${source} ${target} && `);
	});
	return wmlAddCmds.join(' ');
}

// OSA script to open a new terminal and tabs for each command execution
function openTab(cmdArr, cb) {
	const open = ['osascript -e \'tell application "Terminal" to activate\' '];
	const NEW_TAB =
		'-e \'tell application "System Events" to tell process "Terminal" to keystroke "t"';
	const DOWN_COMMAND = "using command down' ";
	const DELAY = "-e 'delay 0.2' ";
	cmdArr.forEach(element => {
		const splitCmds = element.split(' & ');
		if (splitCmds.length == 2) {
			open.push(
				NEW_TAB,
				DOWN_COMMAND,
				DELAY,
				formToDoScriptStr(splitCmds[0]),
				formToDoScriptStr(splitCmds[1])
			);
		} else {
			open.push(NEW_TAB, DOWN_COMMAND, formToDoScriptStr(element));
		}
	});
	exec(open.join(' '));
}

const formToDoScriptStr = cmd => {
	const TO_DO_SCRIPT = '-e \'tell application "Terminal" to do script';
	const IN_FRONT_WINDOW = "in front window' ";
	return [TO_DO_SCRIPT, '"', cmd, '"', IN_FRONT_WINDOW].join(' ');
};

setupDevReactNative();

module.exports = setupDevReactNative;
