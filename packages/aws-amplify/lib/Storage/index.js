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
var Storage_1 = require("./Storage");
exports.StorageClass = Storage_1.default;
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('Storage');
var _instance = null;
if (!_instance) {
    logger.debug('Create Storage Instance');
    _instance = new Storage_1.default(null);
    _instance.vault = new Storage_1.default({ level: 'private' });
    var old_configure_1 = _instance.configure;
    _instance.configure = function (options) {
        logger.debug('configure called');
        old_configure_1.call(_instance, options);
        var vault_options = Object.assign({}, options, { level: 'private' });
        _instance.vault.configure(vault_options);
    };
}
var Storage = _instance;
exports.default = Storage;
//# sourceMappingURL=index.js.map