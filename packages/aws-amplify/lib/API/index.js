"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var API_1 = require("./API");
exports.APIClass = API_1.default;
exports.graphqlOperation = API_1.graphqlOperation;
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('API');
var _instance = null;
if (!_instance) {
    logger.debug('Create API Instance');
    _instance = new API_1.default(null);
}
var API = _instance;
exports.default = API;
//# sourceMappingURL=index.js.map