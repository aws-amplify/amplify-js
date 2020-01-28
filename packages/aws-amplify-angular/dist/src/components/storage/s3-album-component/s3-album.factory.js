import { Component, Input, ViewChild, ComponentFactoryResolver, Output, EventEmitter, } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../component.mount';
import { S3AlbumComponentIonic } from './s3-album.component.ionic';
import { S3AlbumComponentCore } from './s3-album.component.core';
var S3AlbumComponent = /** @class */ (function () {
    function S3AlbumComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.selected = new EventEmitter();
    }
    S3AlbumComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    S3AlbumComponent.prototype.ngOnDestroy = function () { };
    S3AlbumComponent.prototype.loadComponent = function () {
        var _this = this;
        var albumComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(S3AlbumComponentIonic, {
                path: this.path,
                options: this.options,
            })
            : new ComponentMount(S3AlbumComponentCore, {
                path: this.path,
                options: this.options,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(albumComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = albumComponent.data;
        componentRef.instance.selected.subscribe(function (e) {
            _this.selected.emit(e);
        });
    };
    S3AlbumComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-s3-album',
                    template: "\n\t\t<div>\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    S3AlbumComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    S3AlbumComponent.propDecorators = {
        "framework": [{ type: Input },],
        "path": [{ type: Input },],
        "options": [{ type: Input },],
        "selected": [{ type: Output },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return S3AlbumComponent;
}());
export { S3AlbumComponent };
//# sourceMappingURL=s3-album.factory.js.map