import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[component-host]',
})
export class DynamicComponentDirective {
	constructor(public viewContainerRef: ViewContainerRef) {}
}
