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
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-form-container\" *ngIf=\"_show\" data-test=\"" + auth.confirmSignIn.section + "\">\n  <div class=\"amplify-form-body\" data-test=\"" + auth.confirmSignIn.bodySection + "\">\n    <div\n      class=\"amplify-form-header amplify-form-header-ionic\"\n      data-test=\"" + auth.confirmSignIn.headerSection + "\"\n      >\n        {{ this.amplifyService.i18n().get('Confirm your sign in code') }}\n    </div>\n    <ion-list>\n      <ion-item lines=\"none\">\n        <ion-label class=\"amplify-input-label amplify-input-label-ionic\" position=\"stacked\">\n          {{ this.amplifyService.i18n().get('Code *') }}\n        </ion-label>\n        <ion-input\n          #code\n          type=\"text\"\n          class=\"amplify-form-input\"\n          (keyup)=\"setCode(code.value)\"\n          (keyup.enter)=\"onConfirm()\"\n          data-test=\"" + auth.confirmSignIn.codeInput + "\"\n        ></ion-input>\n      </ion-item>\n    </ion-list>\n\n    <div class=\"amplify-form-actions\">\n      <div>\n        <ion-button expand=\"block\" color=\"primary\"\n          (click)=\"onConfirm()\"\n          data-test=\"" + auth.confirmSignIn.confirmButton + "\"\n        >{{ this.amplifyService.i18n().get('Confirm Code') }}</ion-button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n\n</div>\n";
var ConfirmSignInComponentIonic = /** @class */ (function (_super) {
    __extends(ConfirmSignInComponentIonic, _super);
    function ConfirmSignInComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    ConfirmSignInComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-confirm-sign-in-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ConfirmSignInComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return ConfirmSignInComponentIonic;
}(ConfirmSignInComponentCore));
export { ConfirmSignInComponentIonic };
//# sourceMappingURL=confirm-sign-in-component.ionic.js.map