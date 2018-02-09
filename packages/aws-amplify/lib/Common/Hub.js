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
var Logger_1 = require("./Logger");
var logger = new Logger_1.ConsoleLogger('Hub');
var HubClass = /** @class */ (function () {
    function HubClass(name) {
        this.bus = [];
        this.listeners = {};
        this.name = name;
    }
    HubClass.createHub = function (name) {
        return new HubClass(name);
    };
    HubClass.prototype.dispatch = function (channel, payload, source) {
        if (source === void 0) { source = ''; }
        var capsule = {
            'channel': channel,
            'payload': Object.assign({}, payload),
            'source': source
        };
        try {
            this.bus.push(capsule);
            this.toListeners(capsule);
        }
        catch (e) {
            logger.warn('Hub dispatch error', e);
        }
    };
    HubClass.prototype.listen = function (channel, listener, listenerName) {
        if (listenerName === void 0) { listenerName = 'noname'; }
        logger.debug(listenerName + ' listening ' + channel);
        var holder = this.listeners[channel];
        if (!holder) {
            holder = [];
            this.listeners[channel] = holder;
        }
        holder.push({
            'name': listenerName,
            'listener': listener
        });
    };
    HubClass.prototype.toListeners = function (capsule) {
        var channel = capsule.channel, payload = capsule.payload, source = capsule.source;
        var holder = this.listeners[channel];
        if (!holder) {
            return;
        }
        holder.forEach(function (listener) {
            try {
                listener.listener.onHubCapsule(capsule);
            }
            catch (e) {
                logger.warn('error dispatching ' + channel + ' event to ' + listener.name);
            }
        });
        this.bus.pop();
    };
    return HubClass;
}());
exports.HubClass = HubClass;
var Hub = new HubClass('__default__');
exports.default = Hub;
//# sourceMappingURL=Hub.js.map