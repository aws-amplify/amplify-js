import { OnInit, ComponentFactoryResolver, OnDestroy, EventEmitter } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
export declare class ChatBotComponent implements OnInit, OnDestroy {
    private componentFactoryResolver;
    framework: string;
    bot: string;
    title: string;
    clearComplete: boolean;
    conversationModeOn: boolean;
    voiceConfig: any;
    voiceEnabled: boolean;
    textEnabled: boolean;
    complete: EventEmitter<string>;
    componentHost: DynamicComponentDirective;
    constructor(componentFactoryResolver: ComponentFactoryResolver);
    ngOnInit(): void;
    ngOnDestroy(): void;
    loadComponent(): void;
}
