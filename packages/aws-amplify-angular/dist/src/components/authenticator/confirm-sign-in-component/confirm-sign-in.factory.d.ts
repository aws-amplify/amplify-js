import { OnInit, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { AuthState } from '../../../providers';
export declare class ConfirmSignInComponent implements OnInit, OnDestroy {
    private componentFactoryResolver;
    framework: String;
    authState: AuthState;
    hide: string[];
    componentHost: DynamicComponentDirective;
    constructor(componentFactoryResolver: ComponentFactoryResolver);
    ngOnInit(): void;
    ngOnDestroy(): void;
    loadComponent(): void;
}
