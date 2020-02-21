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

import {
	Component,
	Input,
	OnInit,
	ComponentFactoryResolver,
	OnDestroy,
	ViewContainerRef,
	Inject,
} from '@angular/core';
import { ComponentMount } from '../../component.mount';
import { RequireNewPasswordClass } from './require-new-password.class';
import { RequireNewPasswordComponentIonic } from './require-new-password.component.ionic';
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';
import { AuthState } from '../../../providers';

@Component({
	selector: 'amplify-auth-require-new-password',
	template: `
		<div>
			<ng-template component-host></ng-template>
		</div>
	`,
})
export class RequireNewPasswordComponent implements OnInit, OnDestroy {
	@Input() framework: string;
	@Input() authState: AuthState;
	@Input() hide: string[] = [];
	viewContainerRef: ViewContainerRef;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		@Inject('dynamic-component-service') shared
	) {
		shared.onContainerCreated(container => {
			this.viewContainerRef = container;
			this.loadComponent();
		});

		shared.onContainerDestroyed(() => {
			this.viewContainerRef = undefined;
		});
	}

	ngOnInit() {}

	ngOnDestroy() {}

	loadComponent() {
		const requireNewPasswordComponent =
			this.framework && this.framework.toLowerCase() === 'ionic'
				? new ComponentMount(RequireNewPasswordComponentIonic, {
						authState: this.authState,
						hide: this.hide,
				  })
				: new ComponentMount(RequireNewPasswordComponentCore, {
						authState: this.authState,
						hide: this.hide,
				  });

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
			requireNewPasswordComponent.component
		);

		this.viewContainerRef.clear();

		const componentRef = this.viewContainerRef.createComponent(
			componentFactory
		);
		(<RequireNewPasswordClass>componentRef.instance).data =
			requireNewPasswordComponent.data;
	}
}
