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
import { PhotoPickerIonicComponent } from './photo-picker.component.ionic';
import { PhotoPickerComponentCore } from './photo-picker.component.core';
var PhotoPickerComponent = /** @class */ (function () {
    function PhotoPickerComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.picked = new EventEmitter();
        this.loaded = new EventEmitter();
        this.uploaded = new EventEmitter();
    }
    PhotoPickerComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    PhotoPickerComponent.prototype.ngOnDestroy = function () { };
    PhotoPickerComponent.prototype.loadComponent = function () {
        var _this = this;
        var photoPickerComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(PhotoPickerIonicComponent, {
                url: this.url,
                path: this.path,
                storageOptions: this.storageOptions,
            })
            : new ComponentMount(PhotoPickerComponentCore, {
                url: this.url,
                path: this.path,
                storageOptions: this.storageOptions,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(photoPickerComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = photoPickerComponent.data;
        componentRef.instance.picked.subscribe(function (e) {
            _this.picked.emit(e);
        });
        componentRef.instance.loaded.subscribe(function (e) {
            _this.loaded.emit(e);
        });
        componentRef.instance.uploaded.subscribe(function (e) {
            _this.uploaded.emit(e);
        });
    };
    PhotoPickerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-photo-picker',
                    template: "\n\t\t<div class=\"amplify-component\">\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    PhotoPickerComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    PhotoPickerComponent.propDecorators = {
        "framework": [{ type: Input },],
        "url": [{ type: Input },],
        "path": [{ type: Input },],
        "storageOptions": [{ type: Input },],
        "picked": [{ type: Output },],
        "loaded": [{ type: Output },],
        "uploaded": [{ type: Output },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return PhotoPickerComponent;
}());
export { PhotoPickerComponent };
//# sourceMappingURL=photo-picker.factory.js.map