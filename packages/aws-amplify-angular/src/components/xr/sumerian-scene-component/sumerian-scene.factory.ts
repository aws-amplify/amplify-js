import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { SumerianSceneClass } from './sumerian-scene.class';
import { SumerianSceneComponentCore } from './sumerian-scene.component.core';
import { SumerianSceneComponentIonic } from './sumerian-scene.component.ionic'

@Component({
  selector: 'amplify-sumerian-scene',
  template: `
              <ng-template component-host></ng-template>
            `
})
export class SumerianSceneComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() sceneName: string;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let sumerianScene = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(SumerianSceneComponentIonic,{sceneName: this.sceneName}) : new ComponentMount(SumerianSceneComponentCore, {sceneName: this.sceneName});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(sumerianScene.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SumerianSceneClass>componentRef.instance).data = sumerianScene.data;
  }
}