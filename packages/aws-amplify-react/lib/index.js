'use strict';
function __export(m) {
	for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, '__esModule', { value: true });
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var core_1 = require('@aws-amplify/core');
var AmplifyI18n_1 = require('./AmplifyI18n');
__export(require('./AmplifyUI'));
__export(require('./Auth'));
__export(require('./Analytics'));
__export(require('./Storage'));
__export(require('./Widget'));
__export(require('./API'));
__export(require('./Interactions'));
__export(require('./XR'));
var AmplifyTheme_1 = require('./AmplifyTheme');
exports.AmplifyTheme = AmplifyTheme_1.default;
var AmplifyMessageMap_1 = require('./AmplifyMessageMap');
exports.AmplifyMessageMapEntries = AmplifyMessageMap_1.MapEntries;
var AmplifyUI_1 = require('./AmplifyUI');
exports.transparent1X1 = AmplifyUI_1.transparent1X1;
exports.white1X1 = AmplifyUI_1.white1X1;
core_1.I18n.putVocabularies(AmplifyI18n_1.default);
//# sourceMappingURL=index.js.map
