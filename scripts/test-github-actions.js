// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
'use strict';

const glob = require('glob');
const fs = require('fs');
const yaml = require('js-yaml');

function parseYamlFile(file) {
	const fileContents = fs.readFileSync(file, 'utf8');
	return yaml.safeLoad(fileContents);
}

function getKeyValuesFor(targetKey, yamlObject) {
	const values = [];

	function traverseYaml(obj) {
		if (typeof obj === 'object') {
			for (const key in obj) {
				if (key === targetKey) {
					values.push(obj[key]);
				}
				traverseYaml(obj[key]);
			}
		}
	}

	traverseYaml(yamlObject);

	return values;
}

const actionYmlFiles = glob.sync('./.github/actions/*/action.yml');
const workflowYmlFiles = glob.sync('./.github/workflows/*.yml');

let exitCode = 0;

for (const file of [...workflowYmlFiles, ...actionYmlFiles]) {
	const ymlContents = parseYamlFile(file);

	// Check for variable use in run commands
	const variableTemplatePattern = /(\${{.*?}})/g;
	const runCommandValues = getKeyValuesFor('run', ymlContents);
	for (const val of runCommandValues) {
		if (val.match(variableTemplatePattern)) {
			console.log(`There is an inline variabled used in ${file}`);
			exitCode = 1;
		}
	}

	// Check that all external actions are versioned
	const localPathPattern = /^\.\//;
	const fullyReferencedActionPattern = /^[a-zA-Z0-9-_\/]+@[a-fA-F0-9]{40}$/;
	const usesValues = getKeyValuesFor('uses', ymlContents);
	for (const val of usesValues) {
		// When the action is local to the package, then we're good
		if (val.match(localPathPattern)) {
			continue;
		}
		// When the action is fully referenced with a 40 character git id, then we're good
		if (val.match(fullyReferencedActionPattern)) {
			continue;
		}
		console.log(
			`In ${file} the uses reference ${val} must either be local to the project or fully reference a specific action commit on an external project`
		);
		exitCode = 1;
	}
}

process.exit(exitCode);
