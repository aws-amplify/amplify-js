import { Directive, ViewContainerRef } from '@angular/core';
var DynamicComponentDirective = /** @class */ (function () {
    function DynamicComponentDirective(viewContainerRef) {
        this.viewContainerRef = viewContainerRef;
    }
    DynamicComponentDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[component-host]',
                },] },
    ];
    /** @nocollapse */
    DynamicComponentDirective.ctorParameters = function () { return [
        { type: ViewContainerRef, },
    ]; };
    return DynamicComponentDirective;
}());
export { DynamicComponentDirective };
//# sourceMappingURL=dynamic.component.directive.js.map