/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { SumerianSceneClass } from './sumerian-scene.class';
import { SumerianSceneComponentCore } from './sumerian-scene.component.core';
import { SumerianSceneComponentIonic } from './sumerian-scene.component.ionic';

@Component({
	selector: 'amplify-sumerian-scene',
	template: `
		<ng-template component-host></ng-template>
	`,
})
export class SumerianSceneComponent implements OnInit, OnDestroy {
	@Input() framework: string;
	@Input() sceneName: string;
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
		const sumerianScene =
			this.framework && this.framework.toLowerCase() === 'ionic'
				? new ComponentMount(SumerianSceneComponentIonic, {
						sceneName: this.sceneName,
				  })
				: new ComponentMount(SumerianSceneComponentCore, {
						sceneName: this.sceneName,
				  });

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
			sumerianScene.component
		);

		this.viewContainerRef.clear();

		const componentRef = this.viewContainerRef.createComponent(
			componentFactory
		);
		(<SumerianSceneClass>componentRef.instance).data = sumerianScene.data;
	}
}
