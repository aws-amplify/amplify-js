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
import { Component, Input } from '@angular/core';
var template = "\n<div class=\"amplify-form\">\n  <div class=\"form-header\">\n    <div class=\"form-title\">{{ title }}</div>\n  </div>\n  <div class=\"form-body\">\n    <ng-content select=\"[form-body]\"></ng-content>\n  </div>\n  <div class=\"form-footer\">\n    <ng-content select=\"[form-footer]\"></ng-content>\n  </div>\n</div>\n";
var FormComponent = /** @class */ (function () {
    function FormComponent() {
    }
    Object.defineProperty(FormComponent.prototype, "title", {
        set: function (title) {
            this.title = title;
        },
        enumerable: true,
        configurable: true
    });
    FormComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-form',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    FormComponent.propDecorators = {
        "title": [{ type: Input },],
    };
    return FormComponent;
}());
export { FormComponent };
//# sourceMappingURL=form.component.js.map