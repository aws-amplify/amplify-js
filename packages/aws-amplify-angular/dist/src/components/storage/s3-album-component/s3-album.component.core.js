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
var template = "\n<div class=\"amplify-album\">\n  <div class=\"amplify-album-container\">\n    <amplify-s3-image-core\n      class=\"amplify-image-container\"\n      *ngFor=\"let item of list\"\n      path=\"{{item.path}}\"\n      [options]=\"_options\"\n      (selected)=\"onImageSelected($event)\"\n    ></amplify-s3-image-core>\n  </div>\n</div>\n";
var S3AlbumComponentCore = /** @class */ (function () {
    function S3AlbumComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._options = {};
        this.selected = new EventEmitter();
        this.logger = this.amplifyService.logger('S3AlbumComponent');
    }
    S3AlbumComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.storage()) {
            throw new Error('Storage module not registered on AmplifyService provider');
        }
        this.getList(this._path, this._options);
    };
    S3AlbumComponentCore.prototype.onImageSelected = function (event) {
        this.selected.emit(event);
    };
    Object.defineProperty(S3AlbumComponentCore.prototype, "data", {
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
    Object.defineProperty(S3AlbumComponentCore.prototype, "path", {
        set: function (path) {
            this._path = path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(S3AlbumComponentCore.prototype, "options", {
        set: function (options) {
            this._options = options;
        },
        enumerable: true,
        configurable: true
    });
    S3AlbumComponentCore.prototype.getList = function (path, options) {
        var _this = this;
        if (!path) {
            return;
        }
        this.amplifyService
            .storage()
            .list(path, options)
            .then(function (data) {
            _this.list = data.map(function (item) {
                return { path: item.key };
            });
        })
            .catch(function (e) { return console.error(e); });
    };
    S3AlbumComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-s3-album-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    S3AlbumComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, },
    ]; };
    S3AlbumComponentCore.propDecorators = {
        "selected": [{ type: Output },],
        "data": [{ type: Input },],
        "path": [{ type: Input },],
        "options": [{ type: Input },],
    };
    return S3AlbumComponentCore;
}());
export { S3AlbumComponentCore };
//# sourceMappingURL=s3-album.component.core.js.map