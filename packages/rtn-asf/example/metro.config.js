const path = require('path');

const { getDefaultConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../../');

const config = getDefaultConfig(projectRoot);

// only look for internal deps from monorepo root
const monorepoPackages = {
	'@aws-amplify/rtn-asf': path.resolve(
		monorepoRoot,
		'packages/rtn-asf',
	),
};

config.watchFolders = [
	projectRoot,
	monorepoRoot,
	...Object.values(monorepoPackages),
];

config.transformer = {
	...config.transformer,
	getTransformOptions: () => ({
		transform: {
			experimentalImportSupport: false,
			inlineRequires: true,
		},
	}),
};

// add internal deps as extra node modules
config.resolver.extraNodeModules = monorepoPackages;

// disable default node dependency resolution functionality
config.resolver.disableHierarchicalLookup = true;

// only look for node modules here
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(monorepoRoot, 'node_modules'),
];

config.projectRoot = projectRoot;

// can be disabled
config.resetCache = true;

module.exports = config;
