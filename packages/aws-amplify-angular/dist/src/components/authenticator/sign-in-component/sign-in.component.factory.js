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
import { SignInComponentIonic } from './sign-in.component.ionic';
import { SignInComponentCore } from './sign-in.component.core';
var SignInComponent = /** @class */ (function () {
    function SignInComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.usernameAttributes = 'username';
        this.hide = [];
    }
    SignInComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    SignInComponent.prototype.ngOnDestroy = function () { };
    SignInComponent.prototype.loadComponent = function () {
        var authComponent = this.framework && this.framework === 'ionic'
            ? new ComponentMount(SignInComponentIonic, {
                authState: this.authState,
                hide: this.hide,
                usernameAttributes: this.usernameAttributes,
            })
            : new ComponentMount(SignInComponentCore, {
                authState: this.authState,
                hide: this.hide,
                usernameAttributes: this.usernameAttributes,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = authComponent.data;
    };
    SignInComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-sign-in',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    SignInComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    SignInComponent.propDecorators = {
        "framework": [{ type: Input },],
        "authState": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
        "hide": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return SignInComponent;
}());
export { SignInComponent };
//# sourceMappingURL=sign-in.component.factory.js.map