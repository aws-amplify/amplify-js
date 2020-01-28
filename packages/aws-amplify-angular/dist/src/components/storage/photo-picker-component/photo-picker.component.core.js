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
import { Component, Input, Output, EventEmitter, Inject, } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
var template = "\n<div class=\"amplify-photo-picker\">\n<div class=\"amplify-photo-picker-container\">\n  <div class=\"amplify-form-header\">Select Photos</div>\n  <div class=\"amplify-photo-picker-upload\" *ngIf=\"!hasPhoto\"></div>\n  <div class=\"amplify-photo-picker-preview\">\n    <img\n      class=\"amplify-photo-picker-preview\"\n      src=\"{{photoUrl}}\"\n      *ngIf=\"hasPhoto\"\n      (error)=\"onPhotoError()\"\n    />\n  </div>\n  <div class=\"amplify-upload-input\">\n    <input type=\"file\" \n      accept=\"image/*\"\n      (change)=\"pick($event)\"/>\n      <button \n        *ngIf=\"hasPhoto\" \n        class=\"amplify-form-button amplify-upload-button\" \n        (click)=\"uploadFile()\">\n        Upload Photo\n      </button>\n  </div>\n</div>\n<div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n  <div class=\"amplify-alert-body\">\n    <span class=\"amplify-alert-icon\">&#9888;</span>\n    <div class=\"amplify-alert-message\">{{ errorMessage }}</div>\n    <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n  </div>\n</div>\n</div>\n";
var PhotoPickerComponentCore = /** @class */ (function () {
    function PhotoPickerComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this.hasPhoto = false;
        this.uploading = false;
        this.s3ImageFile = null;
        this.s3ImagePath = '';
        this._storageOptions = {};
        this.picked = new EventEmitter();
        this.loaded = new EventEmitter();
        this.uploaded = new EventEmitter();
        this.logger = this.amplifyService.logger('PhotoPickerComponent');
    }
    Object.defineProperty(PhotoPickerComponentCore.prototype, "url", {
        set: function (url) {
            this.photoUrl = url;
            this.hasPhoto = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoPickerComponentCore.prototype, "storageOptions", {
        set: function (storageOptions) {
            this._storageOptions = Object.assign(this._storageOptions, storageOptions);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoPickerComponentCore.prototype, "path", {
        set: function (path) {
            this.s3ImagePath = path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoPickerComponentCore.prototype, "data", {
        set: function (data) {
            this.photoUrl = data.url;
            this.s3ImagePath = data.path;
            this._storageOptions = Object.assign(this._storageOptions, data.storageOptions);
            this.hasPhoto = true;
        },
        enumerable: true,
        configurable: true
    });
    PhotoPickerComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.storage()) {
            throw new Error('Storage module not registered on AmplifyService provider');
        }
    };
    PhotoPickerComponentCore.prototype.pick = function (evt) {
        var file = evt.target.files[0];
        if (!file) {
            return;
        }
        if (!this._storageOptions.contentType) {
            this._storageOptions.contentType = file.type;
        }
        var name = file.name, size = file.size, type = file.type;
        this.picked.emit(file);
        this.s3ImagePath = this.s3ImagePath + "/" + file.name;
        this.s3ImageFile = file;
        var that = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var target = e.target;
            var url = target.result;
            that.photoUrl = url;
            that.hasPhoto = true;
            that.loaded.emit(url);
        };
        reader.readAsDataURL(file);
    };
    PhotoPickerComponentCore.prototype.uploadFile = function () {
        var _this = this;
        this.uploading = true;
        this.amplifyService
            .storage()
            .put(this.s3ImagePath, this.s3ImageFile, this._storageOptions)
            .then(function (result) {
            _this.uploaded.emit(result);
            _this.completeFileUpload();
        })
            .catch(function (error) {
            _this.completeFileUpload(error);
        });
    };
    PhotoPickerComponentCore.prototype.completeFileUpload = function (error) {
        if (error) {
            return this._setError(error);
        }
        this.s3ImagePath = '';
        this.photoUrl = null;
        this.s3ImageFile = null;
        this.uploading = false;
    };
    PhotoPickerComponentCore.prototype.onPhotoError = function () {
        this.hasPhoto = false;
    };
    PhotoPickerComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    PhotoPickerComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
    };
    PhotoPickerComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-photo-picker-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    PhotoPickerComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    PhotoPickerComponentCore.propDecorators = {
        "url": [{ type: Input },],
        "storageOptions": [{ type: Input },],
        "path": [{ type: Input },],
        "data": [{ type: Input },],
        "picked": [{ type: Output },],
        "loaded": [{ type: Output },],
        "uploaded": [{ type: Output },],
    };
    return PhotoPickerComponentCore;
}());
export { PhotoPickerComponentCore };
//# sourceMappingURL=photo-picker.component.core.js.map