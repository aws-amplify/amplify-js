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
import { SignUpComponentIonic } from './sign-up.component.ionic';
import { SignUpComponentCore } from './sign-up.component.core';
var SignUpComponent = /** @class */ (function () {
    function SignUpComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.usernameAttributes = 'username';
        this.hide = [];
    }
    SignUpComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    SignUpComponent.prototype.ngOnDestroy = function () { };
    SignUpComponent.prototype.loadComponent = function () {
        var authComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(SignUpComponentIonic, {
                authState: this.authState,
                signUpConfig: this.signUpConfig,
                usernameAttributes: this.usernameAttributes,
                hide: this.hide,
            })
            : new ComponentMount(SignUpComponentCore, {
                authState: this.authState,
                signUpConfig: this.signUpConfig,
                usernameAttributes: this.usernameAttributes,
                hide: this.hide,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = authComponent.data;
    };
    SignUpComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-sign-up',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    SignUpComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    SignUpComponent.propDecorators = {
        "framework": [{ type: Input },],
        "authState": [{ type: Input },],
        "signUpConfig": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
        "hide": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return SignUpComponent;
}());
export { SignUpComponent };
//# sourceMappingURL=sign-up.factory.js.map