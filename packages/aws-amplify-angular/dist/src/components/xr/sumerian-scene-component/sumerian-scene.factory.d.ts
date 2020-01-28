import { OnInit, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
export declare class SumerianSceneComponent implements OnInit, OnDestroy {
    private componentFactoryResolver;
    framework: string;
    sceneName: string;
    componentHost: DynamicComponentDirective;
    constructor(componentFactoryResolver: ComponentFactoryResolver);
    ngOnInit(): void;
    ngOnDestroy(): void;
    loadComponent(): void;
}
