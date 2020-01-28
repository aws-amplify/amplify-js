import { OnInit, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
export declare class AuthenticatorComponent implements OnInit, OnDestroy {
    private componentFactoryResolver;
    framework: string;
    hide: string[];
    signUpConfig: any;
    usernameAttributes: string;
    componentHost: DynamicComponentDirective;
    constructor(componentFactoryResolver: ComponentFactoryResolver);
    ngOnInit(): void;
    ngOnDestroy(): void;
    loadComponent(): void;
}
