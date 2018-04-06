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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Facet_1 = require("./Facet");
var Logger_1 = require("./Logger");
__export(require("./Facet"));
var ClientDevice_1 = require("./ClientDevice");
exports.ClientDevice = ClientDevice_1.default;
__export(require("./Logger"));
__export(require("./Errors"));
var Hub_1 = require("./Hub");
exports.Hub = Hub_1.default;
var JS_1 = require("./JS");
exports.JS = JS_1.default;
var Signer_1 = require("./Signer");
exports.Signer = Signer_1.default;
var Parser_1 = require("./Parser");
exports.Parser = Parser_1.default;
var OAuthHelper_1 = require("./OAuthHelper");
exports.FacebookOAuth = OAuthHelper_1.FacebookOAuth;
exports.GoogleOAuth = OAuthHelper_1.GoogleOAuth;
__export(require("./RNComponents"));
var Platform_1 = require("./Platform");
exports.Constants = {
    'userAgent': Platform_1.default.userAgent
};
var logger = new Logger_1.ConsoleLogger('Common');
if (Facet_1.AWS['util']) {
    Facet_1.AWS['util'].userAgent = function () {
        return exports.Constants.userAgent;
    };
}
else if (Facet_1.AWS.config) {
    Facet_1.AWS.config.update({ 'customUserAgent': exports.Constants.userAgent });
}
else {
    logger.warn('No AWS.config');
}
//# sourceMappingURL=index.js.map