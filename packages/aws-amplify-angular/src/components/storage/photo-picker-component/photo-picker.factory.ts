import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, Output, EventEmitter } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { PhotoPickerClass } from './photo-picker.class';
import { PhotoPickerIonicComponent } from './photo-picker.component.ionic';
import { PhotoPickerComponentCore } from './photo-picker.component.core';

@Component({
  selector: 'amplify-photo-picker',
  template: `
              <div class='amplify-component'>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class PhotoPickerComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() url: string;
  @Input() path: string;
  @Output()
  picked: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  loaded: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { 
    
  }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}


  loadComponent() {

    let photoPickerComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(PhotoPickerIonicComponent,{url: this.url, path: this.path}) : new ComponentMount(PhotoPickerComponentCore, {url: this.url, path: this.path});

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(photoPickerComponent.component);

    const viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<PhotoPickerClass>componentRef.instance).data = photoPickerComponent.data;

    componentRef.instance.picked.subscribe((e) => {
      this.picked.emit(e);
    });

    componentRef.instance.loaded.subscribe((e) => {
      this.loaded.emit(e);
    });

  }
}
