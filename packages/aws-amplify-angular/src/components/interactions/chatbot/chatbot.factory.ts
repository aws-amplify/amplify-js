import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, Output, EventEmitter } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { ChatBotClass } from './chatbot.class';
import { ChatbotComponentIonic } from './chatbot.component.ionic'
import { ChatbotComponentCore } from './chatbot.component.core';

@Component({
  selector: 'amplify-interactions',
  template: `
              <div class="amplify-component">
                <ng-template component-host></ng-template>
              </div>
            `
})
export class ChatBotComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() bot: string;
  @Input() title: string;
  @Input() clearComplete: boolean;
  @Output()
	complete: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    const interactionParams = {
      bot: this.bot,
      title: this.title,
      clearComplete: this.clearComplete
    }

    let interactionComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(ChatbotComponentIonic, interactionParams) : new ComponentMount(ChatbotComponentCore, interactionParams);

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(interactionComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<ChatBotClass>componentRef.instance).data = interactionComponent.data;

    componentRef.instance.complete.subscribe((e) => {
      this.complete.emit(e);
    })
  }
}
