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
import { ForgotPasswordClass } from './forgot-password.class';
import { ForgotPasswordComponentIonic } from './forgot-password.component.ionic';
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
import { AuthState } from '../../../providers';

@Component({
	selector: 'amplify-auth-forgot-password',
	template: `
		<div>
			<ng-template component-host></ng-template>
		</div>
	`,
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
	@Input() framework: string;
	@Input() authState: AuthState;
	@Input() usernameAttributes: string = 'username';
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
		const authComponent =
			this.framework && this.framework.toLowerCase() === 'ionic'
				? new ComponentMount(ForgotPasswordComponentIonic, {
						authState: this.authState,
						hide: this.hide,
						usernameAttributes: this.usernameAttributes,
				  })
				: new ComponentMount(ForgotPasswordComponentCore, {
						authState: this.authState,
						hide: this.hide,
						usernameAttributes: this.usernameAttributes,
				  });

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
			authComponent.component
		);

		this.viewContainerRef.clear();

		const componentRef = this.viewContainerRef.createComponent(
			componentFactory
		);
		(<ForgotPasswordClass>componentRef.instance).data = authComponent.data;
	}
}
