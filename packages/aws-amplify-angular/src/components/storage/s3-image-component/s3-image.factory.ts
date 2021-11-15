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
	ViewChild,
	ComponentFactoryResolver,
	OnDestroy,
	Output,
	EventEmitter,
} from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../component.mount';
import { S3ImageClass } from './s3-image.class';
import { S3ImageComponentIonic } from './s3-image.component.ionic';
import { S3ImageComponentCore } from './s3-image.component.core';

@Component({
	selector: 'amplify-s3-image',
	template: `
		<div>
			<ng-template component-host></ng-template>
		</div>
	`,
})
export class S3ImageComponent implements OnInit, OnDestroy {
	@Input() framework: string;
	@Input() path: string;
	@Input() options: any;
	@Output()
	selected: EventEmitter<string> = new EventEmitter<string>();
	@ViewChild(DynamicComponentDirective)
	componentHost: DynamicComponentDirective;

	constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

	ngOnInit() {
		this.loadComponent();
	}

	ngOnDestroy() {}

	loadComponent() {
		const imageComponent =
			this.framework && this.framework.toLowerCase() === 'ionic'
				? new ComponentMount(S3ImageComponentIonic, {
						path: this.path,
						options: this.options,
				  })
				: new ComponentMount(S3ImageComponentCore, {
						path: this.path,
						options: this.options,
				  });

		const componentFactory =
			this.componentFactoryResolver.resolveComponentFactory(
				imageComponent.component
			);

		const viewContainerRef = this.componentHost.viewContainerRef;
		viewContainerRef.clear();

		const componentRef = viewContainerRef.createComponent(componentFactory);
		(<S3ImageClass>componentRef.instance).data = imageComponent.data;

		componentRef.instance.selected.subscribe((e) => {
			this.selected.emit(e);
		});
	}
}
