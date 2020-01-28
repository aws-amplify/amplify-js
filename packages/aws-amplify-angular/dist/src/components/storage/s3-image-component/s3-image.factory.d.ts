import { OnInit, ComponentFactoryResolver, OnDestroy, EventEmitter } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
export declare class S3ImageComponent implements OnInit, OnDestroy {
    private componentFactoryResolver;
    framework: string;
    path: string;
    options: any;
    selected: EventEmitter<string>;
    componentHost: DynamicComponentDirective;
    constructor(componentFactoryResolver: ComponentFactoryResolver);
    ngOnInit(): void;
    ngOnDestroy(): void;
    loadComponent(): void;
}
