// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
// tslint:enable
import { Injectable, Optional, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import Amplify, { Logger, I18n } from '@aws-amplify/core';
import { authDecorator } from './auth.decorator';
var AmplifyService = /** @class */ (function () {
    function AmplifyService(modules) {
        if (modules === void 0) { modules = {}; }
        this.modules = modules;
        this._authState = new Subject();
        this.authStateChange$ = this._authState.asObservable();
        var source = modules || Amplify;
        authDecorator(this._authState, source.Auth);
        this._auth = source.Auth;
        this._analytics = source.Analytics;
        this._storage = source.Storage;
        this._api = source.API;
        this._cache = source.Cache;
        this._pubsub = source.PubSub;
        this._interactions = source.Interactions;
        this._xr = source.XR;
        // i18n and logger instantiated by default (do not change)
        this._i18n = I18n;
        this._logger = Logger;
    }
    AmplifyService.prototype.auth = function () {
        return this._auth;
    };
    AmplifyService.prototype.analytics = function () {
        return this._analytics;
    };
    AmplifyService.prototype.storage = function () {
        return this._storage;
    };
    AmplifyService.prototype.api = function () {
        return this._api;
    };
    AmplifyService.prototype.interactions = function () {
        return this._interactions;
    };
    AmplifyService.prototype.cache = function () {
        return this._cache;
    };
    AmplifyService.prototype.pubsub = function () {
        return this._pubsub;
    };
    AmplifyService.prototype.logger = function (name, level) {
        return new this._logger(name, level);
    };
    AmplifyService.prototype.xr = function () {
        return this._xr;
    };
    AmplifyService.prototype.i18n = function () {
        return this._i18n;
    };
    AmplifyService.prototype.authState = function () {
        return this._authState;
    };
    AmplifyService.prototype.setAuthState = function (state) {
        this._authState.next(state);
    };
    AmplifyService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    AmplifyService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: ['modules',] }, { type: Optional },] },
    ]; };
    return AmplifyService;
}());
export { AmplifyService };
//# sourceMappingURL=amplify.service.js.map