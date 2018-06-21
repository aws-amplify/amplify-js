import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { PhotoPickerClass } from './photo-picker.class';
import { PhotoPickerIonicComponent } from './photo-picker.component.ionic'
import { PhotoPickerComponentCore } from './photo-picker.component.core';
import { String } from 'aws-sdk/clients/cognitoidentity';

@Component({
  selector: 'amplify-photo-picker',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class PhotoPickerComponent implements OnInit, OnDestroy {
  @Input() framework: String
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(PhotoPickerIonicComponent,{}) : new ComponentMount(PhotoPickerComponentCore, {});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<PhotoPickerClass>componentRef.instance).data = authComponent.data;
  }
}


