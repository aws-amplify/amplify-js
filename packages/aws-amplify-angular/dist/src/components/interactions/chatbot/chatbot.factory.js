// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// tslint:enable
import { Component, Input, ViewChild, ComponentFactoryResolver, Output, EventEmitter, } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../component.mount';
import { ChatbotComponentIonic } from './chatbot.component.ionic';
import { ChatbotComponentCore } from './chatbot.component.core';
var ChatBotComponent = /** @class */ (function () {
    function ChatBotComponent(componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.complete = new EventEmitter();
    }
    ChatBotComponent.prototype.ngOnInit = function () {
        this.loadComponent();
    };
    ChatBotComponent.prototype.ngOnDestroy = function () { };
    ChatBotComponent.prototype.loadComponent = function () {
        var _this = this;
        var interactionParams = {
            bot: this.bot,
            title: this.title,
            clearComplete: this.clearComplete,
            conversationModeOn: this.conversationModeOn,
            voiceConfig: this.voiceConfig,
            voiceEnabled: this.voiceEnabled,
            textEnabled: this.textEnabled,
        };
        var interactionComponent = this.framework && this.framework.toLowerCase() === 'ionic'
            ? new ComponentMount(ChatbotComponentIonic, interactionParams)
            : new ComponentMount(ChatbotComponentCore, interactionParams);
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(interactionComponent.component);
        var viewContainerRef = this.componentHost.viewContainerRef;
        viewContainerRef.clear();
        var componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.data = interactionComponent.data;
        componentRef.instance.complete.subscribe(function (e) {
            _this.complete.emit(e);
        });
    };
    ChatBotComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-interactions',
                    template: "\n\t\t<div class=\"amplify-component\">\n\t\t\t<ng-template component-host></ng-template>\n\t\t</div>\n\t",
                },] },
    ];
    /** @nocollapse */
    ChatBotComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    ChatBotComponent.propDecorators = {
        "framework": [{ type: Input },],
        "bot": [{ type: Input },],
        "title": [{ type: Input },],
        "clearComplete": [{ type: Input },],
        "conversationModeOn": [{ type: Input },],
        "voiceConfig": [{ type: Input },],
        "voiceEnabled": [{ type: Input },],
        "textEnabled": [{ type: Input },],
        "complete": [{ type: Output },],
        "componentHost": [{ type: ViewChild, args: [DynamicComponentDirective,] },],
    };
    return ChatBotComponent;
}());
export { ChatBotComponent };
//# sourceMappingURL=chatbot.factory.js.map