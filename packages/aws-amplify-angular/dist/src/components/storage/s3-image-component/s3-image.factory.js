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
import { Component, Input, ViewChild, ComponentFactoryResolver, Output, EventEmitter, } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../component.mount';
import { S3ImageComponentIonic } from './s3-image.component.ionic';
import { S3ImageComponentCore } from './s3-image.component.core';
var S3ImageComponent = /** @class */ (function () {
    function S3ImageComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.selected = new EventEmitter();
    }
    S3ImageComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    S3ImageComponent.prototype.ngOnDestroy = function () { };
    S3ImageComponent.prototype.loadComponent = function () {
        var _this = this;
        var imageComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(S3ImageComponentIonic, {
                path: this.path,
                options: this.options,
            })
            : new ComponentMount(S3ImageComponentCore, {
                path: this.path,
                options: this.options,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(imageComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = imageComponent.data;
        componentRef.instance.selected.subscribe(function (e) {
            _this.selected.emit(e);
        });
    };
    S3ImageComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-s3-image',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    S3ImageComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    S3ImageComponent.propDecorators = {
        "framework": [{ type: Input },],
        "path": [{ type: Input },],
        "options": [{ type: Input },],
        "selected": [{ type: Output },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return S3ImageComponent;
}());
export { S3ImageComponent };
//# sourceMappingURL=s3-image.factory.js.map