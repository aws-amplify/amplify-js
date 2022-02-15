'use strict';

const path = require('path');
const yargs = require('yargs');
const { exec } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const os = require('os');
const winston = require('winston');

// Required constants
const WHITE_SPACE = ' ';

// Lerna Constants
const LERNA_BASE = 'npx lerna exec';
const NPM_BASE = 'npm run';
const PARALLEL_FLAG = '--parallel';

// Watchman constants
const WATCHMAN_WATCH_SRC = `watchman watch node_modules/wml/src`;

// WML Constants
const WML_REMOVE_ALL_LINKS = `npx wml rm all`;
const WML_START = `npx wml start`;
const WML_ADD_LINK = 'npx wml add';

// OSAScript constants
const OSA_SCRIPT_BASE = 'osascript';
const MULTILINE_FLAG = '-e';
const TO_DO_SCRIPT = `${MULTILINE_FLAG} 'tell application "Terminal" to do script`;
const IN_FRONT_WINDOW = `in front window'${WHITE_SPACE}`;

// List of packages to exclude that do not have build:watch script
const EXCLUDED_PACKAGES = [
	'aws-amplify-vue',
	'@aws-amplify/ui',
	'@aws-amplify/ui-vue',
	'@aws-amplify/ui-angular',
	'@aws-amplify/ui-components',
	'@aws-amplify/ui-storybook',
	'aws-amplify-angular',
];

// List of CJS identified packages
const CJS_PACKAGES_PRESET = [
	'aws-amplify-react-native',
	'@aws-amplify/pushnotification',
	'@aws-amplify/ui',
];

const UI_PACKAGES_PRESET = ['@aws-amplify/ui-react'];

// Utility functions for string manipulation
// Explicit functions as they are important in an osaScript
const singleQuotedFormOf = content => `'${content}'`;
const doubleQuotedFormOf = content => `"${content}"`;
// Sanatize the command by seperating it into base and args by &
const sanatizeCommand = (base, args) => `("${base}${WHITE_SPACE}" & "${args}")`;

// Constants using the utility fuctions
const getDelay = seconds =>
	`${MULTILINE_FLAG}  ${singleQuotedFormOf(`delay ${seconds}`)}`;
const openNewTab = `${MULTILINE_FLAG} ${singleQuotedFormOf(
	'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'
)}`;

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

// Form the part of osaScript needed to run the given command
const createDoCommand = command =>
	`${TO_DO_SCRIPT} ${command} ${IN_FRONT_WINDOW}`;

// OSA script to open a new terminal and tabs for each command execution
function openTerminalWithTabs(commands, pkgRootPath) {
	let osaScript = `${OSA_SCRIPT_BASE} ${MULTILINE_FLAG} ${singleQuotedFormOf(
		'tell application "Terminal" to activate'
	)} `;
	const goToPackageRoot = sanatizeCommand('cd', pkgRootPath);

	commands.forEach(command => {
		// Split multiple commands to be run in the same using the char ;
		const splitCommands = command.split(`${WHITE_SPACE};${WHITE_SPACE}`);
		const hasTwoOrMoreCommands = splitCommands.length >= 2;

		osaScript += `${openNewTab} ${getDelay(1)} ${createDoCommand(
			goToPackageRoot
		)}${WHITE_SPACE}`;

		if (hasTwoOrMoreCommands) {
			splitCommands.forEach(splitCommand => {
				osaScript += `${getDelay(2)} ${createDoCommand(splitCommand)}`;
			});
		} else {
			osaScript += `${createDoCommand(doubleQuotedFormOf(command))}`;
		}
	});

	exec(osaScript, error => {
		if (error) {
			return logger.error(`Error with one of the tabs: ${error}`);
		}
	});
}

// Primary function for the script
// - Read input arguments
// - Form the required string commands: lerna build:esm:watch, wml and lerna build:cjs:watch
// - Open the commands in a new terminal with a tab for each
function setupDevReactNative() {
	const args = yargs.argv;
	const targetAppPath = args.target ?? args.t;
	const all = args.all ?? args.a;
	const packages = args.packages ?? args.p;
	const pkgRootPath = process.cwd();

	// Exit if package option is not given
	if ((packages === undefined || packages === true) && !all) {
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

	// Exclude unrelated packages
	const supportedPackages = getPackageNames('./packages/').filter(
		packages => !EXCLUDED_PACKAGES.includes(packages)
	);

	// ALL Packages list formation
	const requestedPackages = all ? supportedPackages : packages.split(',');

	const esmPackages = [];
	const cjsPackages = [];

	requestedPackages.forEach(pack => {
		// Exit if the package is not within the supported list of packages
		if (!supportedPackages.includes(pack)) {
			logger.error(
				`Package ${pack} is not supported by this script or does not exist. Here is a list of supported packages: ${supportedPackages}`
			);
			process.exit(0);
		}

		// Divide the requestedPackages into cjs and esm packages
		if (!CJS_PACKAGES_PRESET.includes(pack)) {
			esmPackages.push(pack);
			return;
		}

		cjsPackages.push(pack);
	});

	const finalCommands = [];

	// LERNA build:ESM:watch command with scopes for multiple or all packages
	if (esmPackages.length > 0) {
		finalCommands.push(createLernaCommand('esm', esmPackages));
	}

	// LERNA build:CJS:watch package command to be run in a new tab
	if (cjsPackages.length > 0) {
		finalCommands.push(createLernaCommand('cjs', cjsPackages));
	}

	// WML add command formation
	finalCommands.push(
		createWmlCommand(requestedPackages, targetAppPath, pkgRootPath)
	);

	// Open each command in a new tab in a new terminal
	openTerminalWithTabs(finalCommands, pkgRootPath);
}

// Form the lerna sommand for the specific package type with the given list of packages
const createLernaCommand = (packageType, packages) =>
	`${LERNA_BASE} --scope={${packages.join(
		','
	)},} ${NPM_BASE} build:${packageType}:watch ${PARALLEL_FLAG}`;

// Form the wml command for the specific packages list with the target path
const createWmlCommand = (requestedPackages, targetAppPath, pkgRootPath) => {
	const wmlAddcommand = buildWmlAddStrings(
		requestedPackages,
		targetAppPath,
		pkgRootPath
	);

	// Use char ; to separate commands to be run on the same tab
	return `${doubleQuotedFormOf(WATCHMAN_WATCH_SRC)} ; ${doubleQuotedFormOf(
		WML_REMOVE_ALL_LINKS
	)} ; ${wmlAddcommand} ; ${doubleQuotedFormOf(WML_START)}`;
};

// Get all package names from under the packages directory
const getPackageNames = source =>
	readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => require(`../packages/${dirent.name}/package.json`).name);

// Form all the wml add commands needed
const buildWmlAddStrings = (packages, targetAppPath, pkgRootPath) => {
	let wmlAddCommands = '';
	const packagesDirectory = path.resolve(pkgRootPath, 'packages');
	const sampleAppNodeModulesDirectory = path.join(
		targetAppPath,
		'node_modules'
	);
	packages.forEach(pack => {
		const packageName = pack.split('/')[1] ?? pack;

		let sourceDirectoryName = '';
		if (UI_PACKAGES_PRESET.includes(pack)) {
			sourceDirectoryName = `amplify-${packageName}`;
		} else {
			sourceDirectoryName = packageName;
		}
		const source = path.resolve(packagesDirectory, sourceDirectoryName);
		const target = path.resolve(sampleAppNodeModulesDirectory, pack);
		wmlAddCommands += `${doubleQuotedFormOf(
			`${WML_ADD_LINK}${WHITE_SPACE}`
		)} & ${doubleQuotedFormOf(
			`${source}${WHITE_SPACE}`
		)} & ${doubleQuotedFormOf(`${target}${WHITE_SPACE}&&${WHITE_SPACE}`)} & `;
	});

	// Remove the trailing & with spaces
	return `(${wmlAddCommands.substring(0, wmlAddCommands.length - 3)})`;
};

setupDevReactNative();

module.exports = setupDevReactNative;
