import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, Output, EventEmitter } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { S3ImageClass } from './s3-image.class';
import { S3ImageComponentIonic } from './s3-image.component.ionic'
import { S3ImageComponentCore } from './s3-image.component.core';

@Component({
  selector: 'amplify-s3-image',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class S3ImageComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() path: string;
  @Output()
  selected: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let imageComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(S3ImageComponentIonic,{path:this.path}) : new ComponentMount(S3ImageComponentCore, {path: this.path});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(imageComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<S3ImageClass>componentRef.instance).data = imageComponent.data;

    componentRef.instance.selected.subscribe((e) => {
      this.selected.emit(e);
    })
  }
}
