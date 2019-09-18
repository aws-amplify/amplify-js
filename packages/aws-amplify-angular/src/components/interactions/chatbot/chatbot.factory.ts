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
import { ChatBotClass } from './chatbot.class';
import { ChatbotComponentIonic } from './chatbot.component.ionic';
import { ChatbotComponentCore } from './chatbot.component.core';

@Component({
	selector: 'amplify-interactions',
	template: `
		<div class="amplify-component">
			<ng-template component-host></ng-template>
		</div>
	`,
})
export class ChatBotComponent implements OnInit, OnDestroy {
	@Input() framework: string;
	@Input() bot: string;
	@Input() title: string;
	@Input() clearComplete: boolean;
	@Input() conversationModeOn: boolean;
	@Input() voiceConfig: any;
	@Input() voiceEnabled: boolean;
	@Input() textEnabled: boolean;
	@Output()
	complete: EventEmitter<string> = new EventEmitter<string>();
	@ViewChild(DynamicComponentDirective)
	componentHost: DynamicComponentDirective;

	constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

	ngOnInit() {
		this.loadComponent();
	}

	ngOnDestroy() {}

	loadComponent() {
		const interactionParams = {
			bot: this.bot,
			title: this.title,
			clearComplete: this.clearComplete,
			conversationModeOn: this.conversationModeOn,
			voiceConfig: this.voiceConfig,
			voiceEnabled: this.voiceEnabled,
			textEnabled: this.textEnabled,
		};

		const interactionComponent =
			this.framework && this.framework.toLowerCase() === 'ionic'
				? new ComponentMount(ChatbotComponentIonic, interactionParams)
				: new ComponentMount(ChatbotComponentCore, interactionParams);

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
			interactionComponent.component
		);

		const viewContainerRef = this.componentHost.viewContainerRef;
		viewContainerRef.clear();

		const componentRef = viewContainerRef.createComponent(componentFactory);
		(<ChatBotClass>componentRef.instance).data = interactionComponent.data;

		componentRef.instance.complete.subscribe(e => {
			this.complete.emit(e);
		});
	}
}
