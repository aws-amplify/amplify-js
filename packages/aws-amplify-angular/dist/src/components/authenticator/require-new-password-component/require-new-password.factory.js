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
import { RequireNewPasswordComponentIonic } from './require-new-password.component.ionic';
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';
var RequireNewPasswordComponent = /** @class */ (function () {
    function RequireNewPasswordComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.hide = [];
    }
    RequireNewPasswordComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    RequireNewPasswordComponent.prototype.ngOnDestroy = function () { };
    RequireNewPasswordComponent.prototype.loadComponent = function () {
        var requireNewPasswordComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(RequireNewPasswordComponentIonic, {
                authState: this.authState,
                hide: this.hide,
            })
            : new ComponentMount(RequireNewPasswordComponentCore, {
                authState: this.authState,
                hide: this.hide,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(requireNewPasswordComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data =
            requireNewPasswordComponent.data;
    };
    RequireNewPasswordComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-require-new-password',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    RequireNewPasswordComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    RequireNewPasswordComponent.propDecorators = {
        "framework": [{ type: Input },],
        "authState": [{ type: Input },],
        "hide": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return RequireNewPasswordComponent;
}());
export { RequireNewPasswordComponent };
//# sourceMappingURL=require-new-password.factory.js.map