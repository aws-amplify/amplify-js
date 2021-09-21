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
	const targetAppPath = args.target ?? args.t;
	const packages = args.packages ?? args.p;
	const pkgRootPath = process.cwd();

	// Exit if package option is not given
	if (packages === undefined || packages === true) {
		logger.error('Package option cannot be empty.');
		return;
	}

	// Exit if target app path option is not given
	if (targetAppPath === undefined || targetAppPath === true) {
		logger.error('Target App path cannot be empty.');
		return;
	}

	// Exit if dependent app path is given but does not exist
	if (!existsSync(targetAppPath)) {
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
		// Exit if the package is not within the supported list of packages
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
		finalCmds.push(formLernaCmd('esm', esmPackages));
	}

	// WML add command formation
	finalCmds.push(formWmlCmd(packagesArr, targetAppPath, pkgRootPath));

	// LERNA build:CJS:watch package command to be run in a new tab
	if (cjsPackages.length > 0) {
		finalCmds.push(formLernaCmd('cjs', cjsPackages));
	}

	// Open each command in a new tab in a new terminal
	openTab(finalCmds, pkgRootPath);
}

// Form the lerna sommand for the specific package type with the given list of packages
const formLernaCmd = (packageType, packages) =>
	`npx lerna exec --scope={${packages.join(
		','
	)},} npm run build:${packageType}:watch --parallel`;

// Form the wml command for the specific packages list with the target path
const formWmlCmd = (packagesArr, targetAppPath, pkgRootPath) => {
	const wmlClearCmd = 'npm-exec wml rm all ';
	const wmlAddCmd = buildWmlAddStrings(packagesArr, targetAppPath, pkgRootPath);
	const wmlStart = 'npm-exec wml start';
	const aliasCmd = '("alias " & "npm-exec=\'PATH=$("npm " & "bin"):$PATH\'")';
	return `${aliasCmd} ; ${wmlClearCmd} && ${wmlAddCmd} ${wmlStart}`;
};

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
function buildWmlAddStrings(packages, targetAppPath, pkgRootPath) {
	let wmlAddCmds = [];
	const packagesDir = path.resolve(pkgRootPath, 'packages');
	const sampleAppNodeModulesDir = path.join(targetAppPath, 'node_modules');
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
function openTab(cmdArr, pkgRootPath, cb) {
	const open = ['osascript -e \'tell application "Terminal" to activate\' '];
	const NEW_TAB =
		'-e \'tell application "System Events" to tell process "Terminal" to keystroke "t"';
	const DOWN_COMMAND = "using command down' ";
	const DELAY = "-e 'delay 0.2' ";
	const CD_CWD = `("cd " & "${pkgRootPath}")`;

	cmdArr.forEach(element => {
		const splitCmds = element.split(' ; ');
		if (splitCmds.length == 2) {
			open.push(
				NEW_TAB,
				DOWN_COMMAND,
				DELAY,
				formToDoScriptStr(CD_CWD),
				formToDoScriptStr(`${splitCmds[0]}`),
				formToDoScriptStr(`"${splitCmds[1]}"`)
			);
		} else {
			open.push(
				NEW_TAB,
				DOWN_COMMAND,
				formToDoScriptStr(CD_CWD),
				formToDoScriptStr(`"${element}"`)
			);
		}
	});
	exec(open.join(' '), (error, stdout, stderr) => {
		if (error) {
			return logger.error(`Error with one of the tabs: ${error}`);
		}
	});
}

// Form the part of osaScript needed to run the given command
const formToDoScriptStr = cmd => {
	const TO_DO_SCRIPT = '-e \'tell application "Terminal" to do script';
	const IN_FRONT_WINDOW = "in front window' ";
	return [TO_DO_SCRIPT, cmd, IN_FRONT_WINDOW].join(' ');
};

setupDevReactNative();

module.exports = setupDevReactNative;
