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
import { Component, Input, ViewChild, ComponentFactoryResolver, } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../component.mount';
import { ConfirmSignInComponentIonic } from './confirm-sign-in-component.ionic';
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
var ConfirmSignInComponent = /** @class */ (function () {
    function ConfirmSignInComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.hide = [];
    }
    ConfirmSignInComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    ConfirmSignInComponent.prototype.ngOnDestroy = function () { };
    ConfirmSignInComponent.prototype.loadComponent = function () {
        var authComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(ConfirmSignInComponentIonic, {
                authState: this.authState,
                hide: this.hide,
            })
            : new ComponentMount(ConfirmSignInComponentCore, {
                authState: this.authState,
                hide: this.hide,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = authComponent.data;
    };
    ConfirmSignInComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-confirm-sign-in',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    ConfirmSignInComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    ConfirmSignInComponent.propDecorators = {
        "framework": [{ type: Input },],
        "authState": [{ type: Input },],
        "hide": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return ConfirmSignInComponent;
}());
export { ConfirmSignInComponent };
//# sourceMappingURL=confirm-sign-in.factory.js.map