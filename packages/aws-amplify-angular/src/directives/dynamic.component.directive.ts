import { Directive, ViewContainerRef, Inject } from '@angular/core';

@Directive({
	selector: '[component-host]',
})
export class DynamicComponentDirective {
	constructor(
		public viewContainerRef: ViewContainerRef,
		@Inject('dynamic-component-service') shared
	) {
		shared.registerContainer(viewContainerRef);
	}
}
