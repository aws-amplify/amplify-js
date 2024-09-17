// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * This script takes in the typedoc json output ../docs/reference.json and
 * generates an updated object to be fed into the api template pages in the
 * docs repo.  Specifically the typedoc json output is traversed and each
 * object found in the typedoc json is placed in an object keyed using its
 * id.  The objects are also striped of nested objects having each object
 * replaced with its id to be looked up when needed. Finally the top level
 * categories are added to the flattened object as a list under the
 * key "categories" and the final flattened object is written into the
 * docs folder.
 *
 * This script was developed against typedoc 0.25.8
 *
 */

import references from '../docs/reference.json' assert { type: 'json' };
import { writeFileSync } from 'fs';

// build flat object for easier faster lookups
const flatReferences = {};

/**
 * Traverse the reference object to populate flatReferences.
 * key each reference by its id, and recursively replacing nested objects
 * with references to their ids
 */
const recursivelyPopulateFlatObject = referenceObject => {
	if (!referenceObject) return;
	if (referenceObject['id']) {
		const copy = recursivelyStripObject(structuredClone(referenceObject));
		flatReferences[referenceObject['id']] = copy;
	}

	for (let key in referenceObject) {
		if (referenceObject.hasOwnProperty(key)) {
			if (Array.isArray(referenceObject[key])) {
				referenceObject[key].forEach(child => {
					recursivelyPopulateFlatObject(child);
				});
			} else if (
				typeof referenceObject[key] === 'object' &&
				referenceObject[key] !== null
			) {
				recursivelyPopulateFlatObject(referenceObject[key]);
			}
		}
	}
};

// Traverse an object replacing nested objects with their ids
const recursivelyStripObject = referenceObject => {
	// remove the packageVersion key so that we can detect if any actual docs changes have happened
	if (referenceObject['packageVersion']) {
		delete referenceObject['packageVersion'];
	}

	for (let key in referenceObject) {
		if (referenceObject.hasOwnProperty(key)) {
			if (Array.isArray(referenceObject[key])) {
				referenceObject[key] = referenceObject[key].map(child => {
					return child.id || child;
				});
			} else if (
				typeof referenceObject[key] === 'object' &&
				referenceObject[key] !== null
			) {
				recursivelyStripObject(referenceObject[key]);
			}
		}
	}
	return referenceObject;
};

// function objects have a kind of 64 and variant of 'declaration'
const isFunctionObject = obj => {
	return obj.kind === 64 && obj.variant === 'declaration';
};

recursivelyPopulateFlatObject(references);

// add top level categories to the flattened object
flatReferences['categories'] = flatReferences[1].children.map(catId => {
	const cat = structuredClone(flatReferences[catId]);
	if (cat.children && Array.isArray(cat.children)) {
		cat.children = cat.children
			.map(childId => flatReferences[childId])
			.filter(child => {
				return isFunctionObject(child);
			});
	}
	return cat;
});

// write the file to docs/parsedJson.json
try {
	writeFileSync(
		'docs/parsedJson.json',
		JSON.stringify(flatReferences, null, 2),
		'utf8',
	);
	console.log('Successfully saved parsed API information');
} catch (error) {
	console.log('An error has occurred ', error);
}
