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
import { GreetingComponentIonic } from './greeting.component.ionic';
import { GreetingComponentCore } from './greeting.component.core';
var GreetingComponent = /** @class */ (function () {
    function GreetingComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.usernameAttributes = 'username';
    }
    GreetingComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    GreetingComponent.prototype.ngOnDestroy = function () { };
    GreetingComponent.prototype.loadComponent = function () {
        var authComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(GreetingComponentIonic, {
                authState: this.authState,
                usernameAttributes: this.usernameAttributes,
            })
            : new ComponentMount(GreetingComponentCore, {
                authState: this.authState,
                usernameAttributes: this.usernameAttributes,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = authComponent.data;
    };
    GreetingComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-greetings',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    GreetingComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    GreetingComponent.propDecorators = {
        "framework": [{ type: Input },],
        "authState": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return GreetingComponent;
}());
export { GreetingComponent };
//# sourceMappingURL=greeting.factory.js.map