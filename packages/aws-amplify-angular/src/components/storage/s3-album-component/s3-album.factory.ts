import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { S3AlbumClass } from './s3-album.class';
import { S3AlbumComponentIonic } from './s3-album.component.ionic'
import { S3AlbumComponentCore } from './s3-album.component.core';

@Component({
  selector: 'amplify-s3-album',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class S3AlbumComponent implements OnInit, OnDestroy {
  @Input() framework: string
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework.toLowerCase() === 'ionic' ? new ComponentMount(S3AlbumComponentIonic,{}) : new ComponentMount(S3AlbumComponentCore, {});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<S3AlbumClass>componentRef.instance).data = authComponent.data;
  }
}


