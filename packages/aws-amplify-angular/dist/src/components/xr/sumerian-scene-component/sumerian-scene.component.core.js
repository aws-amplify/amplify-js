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
import { Component, Input } from '@angular/core';
import { AmplifyService } from '../../../providers';
import * as AmplifyUI from '@aws-amplify/ui';
import { sumerianScene } from '../../../assets/data-test-attributes';
var template = "\n<div id=\"sumerian-scene-container\" class={{amplifyUI.sumerianSceneContainer}} data-test=\"" + sumerianScene.container + "\">\n  <div id=\"sumerian-scene-dom-id\" class={{amplifyUI.sumerianScene}} data-test=\"" + sumerianScene.sumerianScene + "\">\n    <sumerian-scene-loading-core *ngIf=\"loading\" loadPercentage={{loadPercentage}} sceneName={{sceneName}} sceneError={{sceneError}} data-test=\"" + sumerianScene.loading + "\"></sumerian-scene-loading-core>\n  </div>\n  <div *ngIf=\"!loading\" class={{amplifyUI.sceneBar}} data-test=\"" + sumerianScene.bar + "\">\n    <span class={{amplifyUI.sceneActions}} data-test=\"" + sumerianScene.actions + "\">\n      <div [ngClass]=\"[amplifyUI.tooltip, showEnableAudio ? amplifyUI.autoShowTooltip : '']\" [attr.data-text]=\"showEnableAudio ? 'The scene is muted. Click to unmute.' : (muted ? 'Unmute' : 'Mute')\" (click)=\"muted ? setMuted(false) : setMuted(true)\">\n        <button class={{amplifyUI.actionButton}}>\n          <svg *ngIf=\"muted\" width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n            <g id=\"icons/minis/volumeOff\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n              <path d=\"M3.48026899,12.9630494 C3.63825091,12.9630494 3.79237961,13.0108921 3.92264322,13.1003479 L8.77467683,16.8113609 C9.29423971,17.1679383 10,16.7950396 10,16.1637406 L10,3.78619489 C10,3.15489596 9.29423971,2.78199725 8.77467683,3.13857463 L3.92264322,6.84545211 C3.79237961,6.93490793 3.63825091,6.9827506 3.48026899,6.9827506 L1.78294894,6.9827506 C1.3505185,6.9827506 1,7.33409518 1,7.76754476 L1,12.1781306 C1,12.6117048 1.3505185,12.9630494 1.78294894,12.9630494 L3.48026899,12.9630494 Z M17.2118156,7 L15.0918385,9.11997713 L12.9718614,7 L12,7.97174685 L14.1200917,10.091724 L12,12.2118156 L12.9718614,13.1835625 L15.0918385,11.0635854 L17.2118156,13.1835625 L18.1835625,12.2118156 L16.0635854,10.091724 L18.1835625,7.97174685 L17.2118156,7 Z\" id=\"Fill-2\" fill=\"#FFFFFF\"></path>\n            </g>\n          </svg>\n          <svg *ngIf=\"!muted\" width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n            <g id=\"icons/minis/volumeOn\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n              <path d=\"M3.48026899,12.9630494 L1.78294894,12.9630494 C1.3505185,12.9630494 1,12.6117048 1,12.1781306 L1,7.76754476 C1,7.33409518 1.3505185,6.9827506 1.78294894,6.9827506 L3.48026899,6.9827506 C3.63825091,6.9827506 3.79237961,6.93490793 3.92264322,6.84545211 L8.77467683,3.13857463 C9.29423971,2.78199725 10,3.15489596 10,3.78619489 L10,16.1637406 C10,16.7950396 9.29423971,17.1679383 8.77467683,16.8113609 L3.92264322,13.1003479 C3.79237961,13.0108921 3.63825091,12.9630494 3.48026899,12.9630494 Z M14.9270376,3.03232286 C15.1729267,3.03232286 15.4040399,3.12815658 15.5777627,3.3022351 C17.3699891,5.09889099 18.3570052,7.48235058 18.3570052,10.0135053 C18.3570052,12.54466 17.3699891,14.9281196 15.5777627,16.7247755 C15.4041045,16.898854 15.1729914,16.9947524 14.9270052,16.9947524 C14.6820861,16.9947524 14.4515549,16.899436 14.2777674,16.7263598 C13.9192316,16.3684383 13.9185203,15.7852882 14.2762477,15.4264291 C15.7222893,13.9769926 16.5186727,12.0545954 16.5186727,10.0135053 C16.5186727,7.97241524 15.7222893,6.05001801 14.2762154,4.60058152 C13.9184879,4.24175473 13.9191992,3.65857229 14.277832,3.30065081 C14.4514256,3.1275746 14.6819567,3.03232286 14.9270376,3.03232286 Z M13.5730665,6.11570485 C14.6133991,7.15574642 15.1862998,8.54003279 15.1862998,10.0134924 C15.1862998,11.4892799 14.6113945,12.8741159 13.5675376,13.9128965 C13.3942351,14.0855848 13.1639626,14.1806425 12.9191727,14.1806425 C12.6727016,14.1806425 12.4412975,14.0844531 12.2677039,13.9097926 C12.0944984,13.7358111 11.9994406,13.5047303 11.9999903,13.2592291 C12.0005723,13.0136956 12.096794,12.7831644 12.2708079,12.6100882 C12.9654406,11.9185917 13.3479995,10.996467 13.3479995,10.0134924 C13.3479995,9.03119677 12.966346,8.1086194 12.2733298,7.4157649 C11.9150203,7.05745543 11.9149233,6.47436998 12.2731358,6.11589885 C12.4467617,5.94224065 12.6775838,5.84666559 12.923085,5.84666559 C13.1685538,5.84666559 13.3993436,5.94220831 13.5730665,6.11570485 Z\" id=\"Fill-2\" fill=\"#FFFFFF\"></path>\n            </g>\n          </svg>\n        </button>\n      </div>\n      <div *ngIf=\"isVRCapable && !isVRPresentationActive\" class={{amplifyUI.tooltip}} data-text=\"Enter VR\" (click)=\"toggleVRPresentation()\">\n        <button class={{amplifyUI.actionButton}}>\n          <svg width=\"19px\" height=\"19px\" viewBox=\"0 0 17 10\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n            <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n              <g id=\"VRon\" fill=\"#FFFFFF\" fill-rule=\"nonzero\">\n                <path d=\"M15.7856977,0.02395184 L15.8915734,0.02395184 C16.5037405,0.02395184 17,0.520211324 17,1.13237842 L17,1.54663675 L17,8.8915038 C17,9.5034193 16.4560011,10 15.7856977,10 L12.0095825,10 C9.98324439,7.1593807 8.80676009,5.741338 8.48012959,5.74587199 C8.16206045,5.75028714 7.01003321,7.1683298 5.02404785,10 L1.21426911,10 C0.543965735,10 3.32031236e-05,9.5034193 3.32031236e-05,8.8915038 L3.32031236e-05,1.54663675 L3.32031236e-05,1.13237842 L3.32031236e-05,1.13237842 C3.32031236e-05,0.520211324 0.496292687,0.02395184 1.10845978,0.02395184 L1.21426911,0.02395184 L15.7856977,0.02395184 Z M4.5,6 C5.32842712,6 6,5.32842712 6,4.5 C6,3.67157288 5.32842712,3 4.5,3 C3.67157288,3 3,3.67157288 3,4.5 C3,5.32842712 3.67157288,6 4.5,6 Z M12.5,6 C13.3284271,6 14,5.32842712 14,4.5 C14,3.67157288 13.3284271,3 12.5,3 C11.6715729,3 11,3.67157288 11,4.5 C11,5.32842712 11.6715729,6 12.5,6 Z\" id=\"Fill-1\"></path>\n              </g>\n            </g>\n          </svg>\n        </button>\n      </div>\n      <div *ngIf=\"isVRCapable && isVRPresentationActive\" class={{amplifyUI.tooltip}} data-text=\"Exit VR\" (click)=\"toggleVRPresentation()\">\n        <button class={{amplifyUI.actionButton}}>\n          <svg width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n            <g id=\"icons/minis/VRon-Copy\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n              <g id=\"Group-7-Copy\" transform=\"translate(1.000000, 3.000000)\" fill=\"#FFFFFF\">\n                <path d=\"M15.7856977,3.02395184 L17,3.02395184 L17,4.13237842 L17,4.54663675 L17,11.8915038 C17,12.5034193 16.4560011,13 15.7856977,13 L12.0095825,13 C9.98324439,10.1593807 8.80676009,8.741338 8.48012959,8.74587199 C8.16206045,8.75028714 7.01003321,10.1683298 5.02404785,13 L1.21426911,13 C0.543965735,13 3.32031236e-05,12.5034193 3.32031236e-05,11.8915038 L3.32031236e-05,4.54663675 L3.32031236e-05,4.13237842 L3.32031236e-05,3.02395184 L1.21426911,3.02395184 L15.7856977,3.02395184 Z M4.5,9 C5.32842712,9 6,8.32842712 6,7.5 C6,6.67157288 5.32842712,6 4.5,6 C3.67157288,6 3,6.67157288 3,7.5 C3,8.32842712 3.67157288,9 4.5,9 Z M12.5,9 C13.3284271,9 14,8.32842712 14,7.5 C14,6.67157288 13.3284271,6 12.5,6 C11.6715729,6 11,6.67157288 11,7.5 C11,8.32842712 11.6715729,9 12.5,9 Z M2.5486669,0 L14.420089,0 C14.7977406,0 15.1613805,0.149260956 15.4374308,0.417695511 L16.9999668,2.00634766 L0,2.00634766 L1.58537972,0.395493117 C1.84682061,0.141306827 2.19106994,0 2.5486669,0 Z\" id=\"Fill-1\"></path>\n              </g>\n            </g>\n          </svg>\n        </button>\n      </div>\n      <div *ngIf=\"!isFullscreen\" class={{amplifyUI.tooltip}} data-text=\"Fullscreen\">\n        <button class={{amplifyUI.actionButton}} (click)=\"maximize()\">\n          <svg width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n            <g id=\"icons/minis/screenfull\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n              <path d=\"M2.04162598,3 L2.04162598,16 L17.0147705,16 L17.0147705,3 L2.04162598,3 Z M1,2 L18,2 L18,17 L1,17 L1,2 Z M3,4 L16,4 L16,15 L3,15 L3,4 Z\" id=\"Rectangle-Copy\" fill=\"#FFFFFF\" fill-rule=\"nonzero\"></path>\n            </g>\n          </svg>\n        </button>\n      </div>\n      <div *ngIf=\"isFullscreen\" class={{amplifyUI.tooltip}} data-text=\"Exit Fullscreen\">\n        <button class={{amplifyUI.actionButton}} (click)=\"minimize()\">\n          <svg width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n            <g id=\"icons/minis/screensmall\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n              <path d=\"M11,16 L17.0147705,16 L17.0147705,3 L2.04162598,3 L2.04162598,10 L11,10 L11,16 Z M1,2 L18,2 L18,17 L1,17 L1,2 Z\" id=\"Rectangle\" fill=\"#FFFFFF\" fill-rule=\"nonzero\"></path>\n            </g>\n          </svg>\n        </button>\n      </div>\n    </span>\n  </div>\n</div>\n";
var SumerianSceneComponentCore = /** @class */ (function () {
    function SumerianSceneComponentCore(amplifyService) {
        var _this = this;
        this.amplifyService = amplifyService;
        this.loading = false;
        this.loadPercentage = 0;
        this.muted = false;
        this.showEnableAudio = false;
        this.isVRCapable = false;
        this.isVRPresentationActive = false;
        this.isFullscreen = false;
        this.sceneError = null;
        this.progressCallback = function (progress) {
            var percentage = progress * 100;
            _this.loadPercentage = percentage;
        };
        this.amplifyUI = AmplifyUI;
        this.logger = this.amplifyService.logger('SumerianSceneComponentCore');
    }
    Object.defineProperty(SumerianSceneComponentCore.prototype, "data", {
        set: function (data) {
            this.sceneName = data.sceneName;
        },
        enumerable: true,
        configurable: true
    });
    SumerianSceneComponentCore.prototype.ngOnInit = function () {
        document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
        if (!this.amplifyService.xr()) {
            throw new Error('XR module not registered on AmplifyService provider');
        }
        this.loadAndStartScene();
    };
    SumerianSceneComponentCore.prototype.ngOnDestroy = function () {
        document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
        document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
        document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
        document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
    };
    SumerianSceneComponentCore.prototype.loadAndStartScene = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sceneOptions, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loading = true;
                        sceneOptions = {
                            progressCallback: this.progressCallback,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.amplifyService
                                .xr()
                                .loadScene(this.sceneName, 'sumerian-scene-dom-id', sceneOptions)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.sceneError = 'Failed to load scene';
                        this.logger.error(this.sceneError, e_1);
                        return [2 /*return*/];
                    case 4:
                        this.amplifyService.xr().start(this.sceneName);
                        this.loading = false;
                        this.muted = this.amplifyService.xr().isMuted(this.sceneName);
                        this.isVRCapable = this.amplifyService.xr().isVRCapable(this.sceneName);
                        this.isVRPresentationActive = this.amplifyService
                            .xr()
                            .isVRPresentationActive(this.sceneName);
                        this.amplifyService
                            .xr()
                            .onSceneEvent(this.sceneName, 'AudioEnabled', function () { return (_this.showEnableAudio = false); });
                        this.amplifyService
                            .xr()
                            .onSceneEvent(this.sceneName, 'AudioDisabled', function () { return (_this.showEnableAudio = true); });
                        return [2 /*return*/];
                }
            });
        });
    };
    SumerianSceneComponentCore.prototype.setMuted = function (muted) {
        this.muted = muted;
        this.amplifyService.xr().setMuted(this.sceneName, muted);
        if (this.showEnableAudio) {
            this.amplifyService.xr().enableAudio(this.sceneName);
            this.showEnableAudio = false;
        }
    };
    SumerianSceneComponentCore.prototype.toggleVRPresentation = function () {
        try {
            if (this.isVRPresentationActive) {
                this.amplifyService.xr().exitVR(this.sceneName);
            }
            else {
                this.amplifyService.xr().enterVR(this.sceneName);
            }
        }
        catch (e) {
            this.logger.error('Unable to start/stop WebVR System: ' + e.message);
            return;
        }
        this.isVRPresentationActive = !this.isVRPresentationActive;
    };
    SumerianSceneComponentCore.prototype.onFullscreenChange = function () {
        var doc = document;
        this.isFullscreen = doc.fullscreenElement !== null;
    };
    SumerianSceneComponentCore.prototype.maximize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sceneDomElement, requestFullScreen;
            return __generator(this, function (_a) {
                sceneDomElement = document.getElementById('sumerian-scene-container');
                requestFullScreen = sceneDomElement.requestFullscreen ||
                    sceneDomElement.msRequestFullscreen ||
                    sceneDomElement.mozRequestFullScreen ||
                    sceneDomElement.webkitRequestFullscreen;
                requestFullScreen.call(sceneDomElement);
                return [2 /*return*/];
            });
        });
    };
    SumerianSceneComponentCore.prototype.minimize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var doc;
            return __generator(this, function (_a) {
                doc = document;
                if (doc.exitFullscreen) {
                    doc.exitFullscreen();
                }
                else if (doc.mozCancelFullScreen) {
                    doc.mozCancelFullScreen();
                }
                else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                }
                return [2 /*return*/];
            });
        });
    };
    SumerianSceneComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'sumerian-scene-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    SumerianSceneComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, },
    ]; };
    SumerianSceneComponentCore.propDecorators = {
        "sceneName": [{ type: Input },],
        "data": [{ type: Input },],
    };
    return SumerianSceneComponentCore;
}());
export { SumerianSceneComponentCore };
//# sourceMappingURL=sumerian-scene.component.core.js.map