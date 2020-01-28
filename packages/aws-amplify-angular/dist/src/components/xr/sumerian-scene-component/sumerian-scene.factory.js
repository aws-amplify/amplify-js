import { Component, Input, ViewChild, ComponentFactoryResolver, } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../component.mount';
import { SumerianSceneComponentCore } from './sumerian-scene.component.core';
import { SumerianSceneComponentIonic } from './sumerian-scene.component.ionic';
var SumerianSceneComponent = /** @class */ (function () {
    function SumerianSceneComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
    }
    SumerianSceneComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    SumerianSceneComponent.prototype.ngOnDestroy = function () { };
    SumerianSceneComponent.prototype.loadComponent = function () {
        var sumerianScene = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(SumerianSceneComponentIonic, {
                sceneName: this.sceneName,
            })
            : new ComponentMount(SumerianSceneComponentCore, {
                sceneName: this.sceneName,
            });
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(sumerianScene.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = sumerianScene.data;
    };
    SumerianSceneComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-sumerian-scene',
                    template: "\n\t\t<ng-template component-host></ng-template>\n\t",
                },] },
    ];
    /** @nocollapse */
    SumerianSceneComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    SumerianSceneComponent.propDecorators = {
        "framework": [{ type: Input },],
        "sceneName": [{ type: Input },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return SumerianSceneComponent;
}());
export { SumerianSceneComponent };
//# sourceMappingURL=sumerian-scene.factory.js.map