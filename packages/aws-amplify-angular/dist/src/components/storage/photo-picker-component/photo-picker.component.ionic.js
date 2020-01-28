var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Component, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { PhotoPickerComponentCore } from './photo-picker.component.core';
var template = "\n<div class=\"amplify-photo-picker\">\n<div class=\"amplify-photo-picker-container\">\n  <div class=\"amplify-form-header\">Select Photos</div>\n  <div class=\"amplify-photo-picker-upload\" *ngIf=\"!hasPhoto\"></div>\n  <div class=\"amplify-photo-picker-preview\">\n    <img\n      class=\"amplify-photo-picker-preview\"\n      src=\"{{photoUrl}}\"\n      *ngIf=\"hasPhoto\"\n      (error)=\"onPhotoError()\"\n    />\n  </div>\n  <div class=\"amplify-upload-input\">\n    <input type=\"file\" \n      accept=\"image/*\"\n      (change)=\"pick($event)\"/>\n      <button \n        *ngIf=\"hasPhoto\" \n        class=\"amplify-form-button amplify-upload-button\" \n        (click)=\"uploadFile()\">\n        Upload Photo\n      </button>\n  </div>\n</div>\n<div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n  <div class=\"amplify-alert-body\">\n    <span class=\"amplify-alert-icon\">&#9888;</span>\n    <div class=\"amplify-alert-message\">{{ errorMessage }}</div>\n    <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n  </div>\n</div>\n</div>\n";
var PhotoPickerIonicComponent = /** @class */ (function (_super) {
    __extends(PhotoPickerIonicComponent, _super);
    function PhotoPickerIonicComponent(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    PhotoPickerIonicComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-photo-picker-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    PhotoPickerIonicComponent.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return PhotoPickerIonicComponent;
}(PhotoPickerComponentCore));
export { PhotoPickerIonicComponent };
//# sourceMappingURL=photo-picker.component.ionic.js.map