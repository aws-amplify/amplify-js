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
import { AuthenticatorIonicComponent } from './authenticator.component.ionic';
import { AuthenticatorComponentCore } from './authenticator.component.core';
var AuthenticatorComponent = /** @class */ (function () {
    function AuthenticatorComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.hide = [];
        this.usernameAttributes = 'username';
    }
    AuthenticatorComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    AuthenticatorComponent.prototype.ngOnDestroy = function () { };
    AuthenticatorComponent.prototype.loadComponent = function () {
        var authComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(AuthenticatorIonicComponent, {
                hide: this.hide,
                signUpConfig: this.signUpConfig,
                usernameAttributes: this.usernameAttributes,
            })
            : new ComponentMount(AuthenticatorComponentCore, {
                hide: this.hide,
                signUpConfig: this.signUpConfig,
                usernameAttributes: this.usernameAttributes,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = authComponent.data;
    };
    AuthenticatorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-authenticator',
                    template: "\n\t\t<div class=\"amplify-component\">\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    AuthenticatorComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    AuthenticatorComponent.propDecorators = {
        "framework": [{ type: Input },],
        "hide": [{ type: Input },],
        "signUpConfig": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return AuthenticatorComponent;
}());
export { AuthenticatorComponent };
//# sourceMappingURL=authenticator.factory.js.map