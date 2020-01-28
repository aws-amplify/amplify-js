var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Inject, } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { isUndefined } from 'util';
require('./aws-lex-audio.js');
var template = "\n<div class=\"amplify-interactions\">\n\t<div class=\"amplify-interactions-container\">\n\t\t<div class=\"amplify-form-container\">\n\t\t\t<div class=\"amplify-form-row\">\n\t\t\t\t<div class=\"amplify-interactions-conversation\">\n\t\t\t\t\t<div *ngFor=\"let message of messages\">\n\t\t\t\t\t\t<div class=\"amplify-interactions-input\">{{message.me}}</div>\n\t\t\t\t\t\t<div class=\"amplify-interactions-input-timestamp\">{{message.meSentTime}}</div>\n\t\t\t\t\t\t<div class=\"amplify-interactions-response\">{{message.bot}}</div>\n\t\t\t\t\t\t<div class=\"amplify-interactions-response-timestamp\">{{message.botSentTime}}</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"amplify-interactions-actions\">\n\t\t\t\t<input #inputValue\n\t\t\t\t\ttype='text'\n\t\t\t\t\tclass=\"amplify-form-input\"\n\t\t\t\t\tplaceholder=\"{{currentVoiceState}}\"\n\t\t\t\t\t[value]=\"inputText\"\n\t\t\t\t\t(keyup.enter)=\"onSubmit(inputValue.value)\"\n\t\t\t\t\t(change)=\"onInputChange($event.target.value)\"\n\t\t\t\t\t[disabled]=\"inputDisabled\"\n\t\t\t\t\t*ngIf=\"textEnabled\">\n\t\t\t\t<input #inputValue\n\t\t\t\t\ttype='text'\n\t\t\t\t\tclass=\"amplify-form-input\"\n\t\t\t\t\tplaceholder=\"{{currentVoiceState}}\"\n\t\t\t\t\t[disabled]=\"!textEnabled\"\n\t\t\t\t\t*ngIf=\"!textEnabled\">\n\n\t\t\t\t<button\n\t\t\t\t\ttype=\"button\"\n\t\t\t\t\t*ngIf=\"voiceEnabled\"\n\t\t\t\t\tng-style=\"{float: 'right'}\"\n\t\t\t\t\t(click)=\"micButtonHandler()\"\n\t\t\t\t\t[disabled]=\"micButtonDisabled\"\n\t\t\t\t>\n\t\t\t\t\t{{micText}}\n\t\t\t\t</button>\n\t\t\t\t<button\n\t\t\t\t\ttype=\"button\"\n\t\t\t\t\t*ngIf=\"textEnabled\"\n\t\t\t\t\tng-style=\"{float: 'right'}\"\n\t\t\t\t\tclass=\"amplify-interactions-button\"\n\t\t\t\t\t[disabled]=\"inputDisabled\"\n\t\t\t\t\tng-click=\"!inputDisabled || onSubmit(inputValue.value)\"\n\t\t\t\t></button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n";
var STATES = {
    INITIAL: { MESSAGE: 'Type your message or click  🎤', ICON: '🎤' },
    LISTENING: { MESSAGE: 'Listening... click 🔴 again to cancel', ICON: '🔴' },
    SENDING: { MESSAGE: 'Please wait...', ICON: '🔊' },
    SPEAKING: { MESSAGE: 'Speaking...', ICON: '...' },
};
var defaultVoiceConfig = {
    silenceDetectionConfig: {
        time: 2000,
        amplitude: 0.2,
    },
};
var ChatbotComponentCore = /** @class */ (function () {
    function ChatbotComponentCore(ref, amplifyService) {
        var _this = this;
        this.amplifyService = amplifyService;
        this.inputText = '';
        this.clearComplete = false;
        this.messages = [];
        this.completions = {};
        this.currentVoiceState = STATES.INITIAL.MESSAGE;
        this.inputDisabled = false;
        this.micText = STATES.INITIAL.ICON;
        this.voiceConfig = defaultVoiceConfig;
        this.continueConversation = false;
        this.micButtonDisabled = false;
        this.conversationModeOn = false;
        this.voiceEnabled = false;
        this.textEnabled = true;
        this.complete = new EventEmitter();
        this.onSilenceHandler = function () {
            if (!_this.continueConversation) {
                return;
            }
            _this.audioControl.exportWAV(function (blob) {
                _this.currentVoiceState = STATES.SENDING.MESSAGE;
                _this.audioInput = blob;
                _this.micText = STATES.SENDING.ICON;
                _this.micButtonDisabled = true;
                _this.lexResponseHandler();
            });
            _this.ref.detectChanges();
        };
        this.ref = ref;
        this.continueConversation = false;
        this.logger = this.amplifyService.logger('ChatbotComponent');
    }
    Object.defineProperty(ChatbotComponentCore.prototype, "data", {
        set: function (data) {
            this.botName = data.bot;
            this.chatTitle = data.title;
            this.clearComplete = data.clearComplete;
            this.conversationModeOn = isUndefined(data.conversationModeOn)
                ? false
                : data.conversationModeOn;
            this.voiceEnabled = isUndefined(data.voiceEnabled)
                ? false
                : data.voiceEnabled;
            this.textEnabled = isUndefined(data.textEnabled) ? true : data.textEnabled;
            this.voiceConfig = data.voiceConfig || this.voiceConfig;
            this.performOnComplete = this.performOnComplete.bind(this);
            this.amplifyService
                .interactions()
                .onComplete(this.botName, this.performOnComplete);
            if (!this.textEnabled && this.voiceEnabled) {
                this.currentVoiceState = 'Click the mic button';
                STATES.INITIAL.MESSAGE = 'Click the mic button';
            }
            if (!this.voiceEnabled && this.textEnabled) {
                this.currentVoiceState = 'Type a message';
                STATES.INITIAL.MESSAGE = 'Type a message';
            }
            if (this.voiceEnabled) {
                this.audioControl = new LexAudio.audioControl();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatbotComponentCore.prototype, "bot", {
        set: function (botName) {
            this.botName = botName;
            this.performOnComplete = this.performOnComplete.bind(this);
            this.amplifyService
                .interactions()
                .onComplete(botName, this.performOnComplete);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatbotComponentCore.prototype, "title", {
        set: function (title) {
            this.chatTitle = title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatbotComponentCore.prototype, "clearOnComplete", {
        set: function (clearComplete) {
            this.clearComplete = clearComplete;
        },
        enumerable: true,
        configurable: true
    });
    ChatbotComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.interactions()) {
            throw new Error('Interactions module not registered on AmplifyService provider');
        }
    };
    ChatbotComponentCore.prototype.performOnComplete = function (evt) {
        this.complete.emit(evt);
        if (this.clearComplete) {
            this.messages = [];
        }
    };
    ChatbotComponentCore.prototype.onInputChange = function (value) {
        this.inputText = value;
    };
    ChatbotComponentCore.prototype.onSubmit = function (e) {
        var _this = this;
        if (!this.inputText) {
            return;
        }
        var message = {
            me: this.inputText,
            meSentTime: new Date().toLocaleTimeString(),
            bot: '',
            botSentTime: '',
        };
        this.amplifyService
            .interactions()
            .send(this.botName, this.inputText)
            .then(function (response) {
            _this.inputText = '';
            message.bot = response.message;
            message.botSentTime = new Date().toLocaleTimeString();
            _this.messages.push(message);
        })
            .catch(function (error) { return _this.logger.error(error); });
    };
    ChatbotComponentCore.prototype.reset = function () {
        this.audioControl.clear();
        this.inputText = '';
        this.currentVoiceState = STATES.INITIAL.MESSAGE;
        this.inputDisabled = false;
        this.micText = STATES.INITIAL.ICON;
        this.continueConversation = false;
        this.micButtonDisabled = false;
        this.ref.detectChanges();
    };
    ChatbotComponentCore.prototype.onError = function (error) {
        this.logger.error(error);
    };
    ChatbotComponentCore.prototype.lexResponseHandler = function () {
        return __awaiter(this, void 0, void 0, function () {
            var interactionsMessage, response, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.continueConversation) {
                            return [2 /*return*/];
                        }
                        interactionsMessage = {
                            content: this.audioInput,
                            options: {
                                messageType: 'voice',
                            },
                        };
                        return [4 /*yield*/, this.amplifyService
                                .interactions()
                                .send(this.botName, interactionsMessage)];
                    case 1:
                        response = _a.sent();
                        this.lexResponse = response;
                        this.currentVoiceState = STATES.SPEAKING.MESSAGE;
                        this.micText = STATES.SPEAKING.ICON;
                        this.micButtonDisabled = true;
                        message = {
                            me: this.lexResponse.inputTranscript,
                            meSentTime: new Date().toLocaleTimeString(),
                            bot: '',
                            botSentTime: '',
                        };
                        this.inputText = '';
                        message.bot = this.lexResponse.message;
                        message.botSentTime = new Date().toLocaleTimeString();
                        this.messages.push(message);
                        this.doneSpeakingHandler();
                        this.ref.detectChanges();
                        return [2 /*return*/];
                }
            });
        });
    };
    ChatbotComponentCore.prototype.doneSpeakingHandler = function () {
        var _this = this;
        if (!this.continueConversation) {
            return;
        }
        if (this.lexResponse.contentType === 'audio/mpeg') {
            this.audioControl.play(this.lexResponse.audioStream, function () {
                if (_this.lexResponse.dialogState === 'ReadyForFulfillment' ||
                    _this.lexResponse.dialogState === 'Fulfilled' ||
                    _this.lexResponse.dialogState === 'Failed' ||
                    !_this.conversationModeOn) {
                    _this.inputDisabled = false;
                    _this.currentVoiceState = STATES.INITIAL.MESSAGE;
                    _this.micText = STATES.INITIAL.ICON;
                    _this.micButtonDisabled = false;
                    _this.continueConversation = false;
                    _this.ref.detectChanges();
                }
                else {
                    _this.currentVoiceState = STATES.LISTENING.MESSAGE;
                    _this.micText = STATES.LISTENING.ICON;
                    _this.micButtonDisabled = false;
                    _this.audioControl.startRecording(_this.onSilenceHandler, null, _this.voiceConfig.silenceDetectionConfig);
                    _this.ref.detectChanges();
                }
            });
        }
        else {
            this.inputDisabled = false;
            this.currentVoiceState = STATES.INITIAL.MESSAGE;
            this.micText = STATES.INITIAL.ICON;
            this.micButtonDisabled = false;
            this.continueConversation = false;
            this.ref.detectChanges();
        }
    };
    ChatbotComponentCore.prototype.micButtonHandler = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.continueConversation) {
                    this.reset();
                    this.ref.detectChanges();
                }
                else {
                    this.inputDisabled = true;
                    this.continueConversation = true;
                    this.currentVoiceState = STATES.LISTENING.MESSAGE;
                    this.micText = STATES.LISTENING.ICON;
                    this.micButtonDisabled = false;
                    this.audioControl.startRecording(this.onSilenceHandler, null, this.voiceConfig.silenceDetectionConfig);
                    this.ref.detectChanges();
                }
                return [2 /*return*/];
            });
        });
    };
    ChatbotComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-interactions-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ChatbotComponentCore.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    ChatbotComponentCore.propDecorators = {
        "complete": [{ type: Output },],
        "data": [{ type: Input },],
        "bot": [{ type: Input },],
        "title": [{ type: Input },],
        "clearOnComplete": [{ type: Input },],
    };
    return ChatbotComponentCore;
}());
export { ChatbotComponentCore };
//# sourceMappingURL=chatbot.component.core.js.map