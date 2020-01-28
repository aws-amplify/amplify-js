import { OnInit, ComponentFactoryResolver, OnDestroy, EventEmitter } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
export declare class PhotoPickerComponent implements OnInit, OnDestroy {
    private componentFactoryResolver;
    framework: string;
    url: string;
    path: string;
    storageOptions: any;
    picked: EventEmitter<string>;
    loaded: EventEmitter<string>;
    uploaded: EventEmitter<Object>;
    componentHost: DynamicComponentDirective;
    constructor(componentFactoryResolver: ComponentFactoryResolver);
    ngOnInit(): void;
    ngOnDestroy(): void;
    loadComponent(): void;
}
