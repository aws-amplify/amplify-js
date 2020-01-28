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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
var template = "\n  <img\n    class=\"amplify-image\"\n    (click)=\"onImageClicked()\"\n    src=\"{{url}}\"\n  />\n";
var S3ImageComponentCore = /** @class */ (function () {
    function S3ImageComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._options = {};
        this.selected = new EventEmitter();
        this.logger = this.amplifyService.logger('S3ImageComponent');
    }
    Object.defineProperty(S3ImageComponentCore.prototype, "data", {
        set: function (data) {
            if (!data.path) {
                return;
            }
            this._path = data.path;
            this._options = data.options;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(S3ImageComponentCore.prototype, "path", {
        set: function (path) {
            this._path = path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(S3ImageComponentCore.prototype, "options", {
        set: function (options) {
            this._options = options;
        },
        enumerable: true,
        configurable: true
    });
    S3ImageComponentCore.prototype.ngOnInit = function () {
        if (!this._path) {
            return;
        }
        if (!this.amplifyService.storage()) {
            throw new Error('Storage module not registered on AmplifyService provider');
        }
        this.getImage(this._path, this._options);
    };
    S3ImageComponentCore.prototype.onImageClicked = function () {
        this.selected.emit(this.url);
    };
    S3ImageComponentCore.prototype.getImage = function (path, options) {
        var _this = this;
        this.amplifyService
            .storage()
            .get(path, options)
            .then(function (url) { return (_this.url = url); })
            .catch(function (e) { return console.error(e); });
    };
    S3ImageComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-s3-image-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    S3ImageComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, },
    ]; };
    S3ImageComponentCore.propDecorators = {
        "selected": [{ type: Output },],
        "data": [{ type: Input },],
        "path": [{ type: Input },],
        "options": [{ type: Input },],
    };
    return S3ImageComponentCore;
}());
export { S3ImageComponentCore };
//# sourceMappingURL=s3-image.component.core.js.map