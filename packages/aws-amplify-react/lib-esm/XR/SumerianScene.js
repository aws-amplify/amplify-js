var __extends =
	(this && this.__extends) ||
	(function() {
		var extendStatics = function(d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function(d, b) {
						d.__proto__ = b;
					}) ||
				function(d, b) {
					for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype =
				b === null
					? Object.create(b)
					: ((__.prototype = b.prototype), new __());
		};
	})();
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import * as React from 'react';
import XR from '@aws-amplify/xr';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import IconButton from './IconButton';
import Loading from './Loading';
import * as AmplifyUI from '@aws-amplify/ui';
import { sumerianScene } from '../Amplify-UI/data-test-attributes';
var SCENE_CONTAINER_DOM_ID = 'scene-container-dom-id';
var SCENE_DOM_ID = 'scene-dom-id';
var logger = new Logger('SumerianScene');
var SumerianScene = /** @class */ (function(_super) {
	__extends(SumerianScene, _super);
	function SumerianScene(props) {
		var _this = _super.call(this, props) || this;
		_this.state = {
			showEnableAudio: false,
			muted: false,
			loading: true,
			percentage: 0,
			isFullscreen: false,
			sceneError: null,
			isVRPresentationActive: false,
		};
		return _this;
	}
	SumerianScene.prototype.setStateAsync = function(state) {
		var _this = this;
		return new Promise(function(resolve) {
			_this.setState(state, resolve);
		});
	};
	SumerianScene.prototype.componentDidMount = function() {
		document.addEventListener(
			'fullscreenchange',
			this.onFullscreenChange.bind(this)
		);
		document.addEventListener(
			'webkitfullscreenchange',
			this.onFullscreenChange.bind(this)
		);
		document.addEventListener(
			'mozfullscreenchange',
			this.onFullscreenChange.bind(this)
		);
		document.addEventListener(
			'MSFullscreenChange',
			this.onFullscreenChange.bind(this)
		);
		this.loadAndSetupScene(this.props.sceneName, SCENE_DOM_ID);
	};
	SumerianScene.prototype.componentWillUnmount = function() {
		document.removeEventListener(
			'fullscreenchange',
			this.onFullscreenChange.bind(this)
		);
		document.removeEventListener(
			'webkitfullscreenchange',
			this.onFullscreenChange.bind(this)
		);
		document.removeEventListener(
			'mozfullscreenchange',
			this.onFullscreenChange.bind(this)
		);
		document.removeEventListener(
			'MSFullscreenChange',
			this.onFullscreenChange.bind(this)
		);
	};
	SumerianScene.prototype.loadAndSetupScene = function(sceneName, sceneDomId) {
		return __awaiter(this, void 0, void 0, function() {
			var sceneOptions, e_1, sceneError;
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						this.setStateAsync({ loading: true });
						sceneOptions = {
							progressCallback: function(progress) {
								var percentage = progress * 100;
								_this.setState({ percentage: percentage });
							},
						};
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 4]);
						return [
							4 /*yield*/,
							XR.loadScene(sceneName, sceneDomId, sceneOptions),
						];
					case 2:
						_a.sent();
						return [3 /*break*/, 4];
					case 3:
						e_1 = _a.sent();
						sceneError = {
							displayText: 'Failed to load scene',
							error: e_1,
						};
						logger.error(sceneError.displayText, sceneError.error);
						this.setStateAsync({ sceneError: sceneError });
						return [2 /*return*/];
					case 4:
						XR.start(sceneName);
						this.setStateAsync({
							muted: XR.isMuted(sceneName),
							isVRPresentationActive: XR.isVRPresentationActive(sceneName),
							loading: false,
						});
						XR.onSceneEvent(sceneName, 'AudioEnabled', function() {
							return _this.setStateAsync({ showEnableAudio: false });
						});
						XR.onSceneEvent(sceneName, 'AudioDisabled', function() {
							return _this.setStateAsync({ showEnableAudio: true });
						});
						return [2 /*return*/];
				}
			});
		});
	};
	SumerianScene.prototype.setMuted = function(muted) {
		if (this.state.showEnableAudio) {
			XR.enableAudio(this.props.sceneName);
			this.setState({ showEnableAudio: false });
		}
		XR.setMuted(this.props.sceneName, muted);
		this.setState({ muted: muted });
	};
	SumerianScene.prototype.onFullscreenChange = function() {
		var doc = document;
		this.setState({ isFullscreen: doc.fullscreenElement !== null });
	};
	SumerianScene.prototype.maximize = function() {
		return __awaiter(this, void 0, void 0, function() {
			var sceneDomElement;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						sceneDomElement = document.getElementById(SCENE_CONTAINER_DOM_ID);
						return [4 /*yield*/, sceneDomElement.requestFullscreen()];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	SumerianScene.prototype.minimize = function() {
		return __awaiter(this, void 0, void 0, function() {
			var doc;
			return __generator(this, function(_a) {
				doc = document;
				if (doc.exitFullscreen) {
					doc.exitFullscreen();
				} else if (doc.mozCancelFullScreen) {
					doc.mozCancelFullScreen();
				} else if (doc.webkitExitFullscreen) {
					doc.webkitExitFullscreen();
				}
				return [2 /*return*/];
			});
		});
	};
	SumerianScene.prototype.toggleVRPresentation = function() {
		try {
			if (this.state.isVRPresentationActive) {
				XR.exitVR(this.props.sceneName);
			} else {
				XR.enterVR(this.props.sceneName);
			}
		} catch (e) {
			logger.error('Unable to start/stop WebVR System: ' + e.message);
			return;
		}
		this.setState({
			isVRPresentationActive: !this.state.isVRPresentationActive,
		});
	};
	SumerianScene.prototype.render = function() {
		var _this = this;
		var muteButton;
		var enterOrExitVRButton;
		var screenSizeButton;
		if (XR.isSceneLoaded(this.props.sceneName)) {
			if (this.state.showEnableAudio) {
				muteButton = React.createElement(IconButton, {
					variant: 'sound-mute',
					tooltip: 'The scene is muted. Click to unmute.',
					onClick: function() {
						return _this.setMuted(false);
					},
					autoShowTooltip: true,
				});
			} else if (XR.isMuted(this.props.sceneName)) {
				muteButton = React.createElement(IconButton, {
					variant: 'sound-mute',
					tooltip: 'Unmute',
					onClick: function() {
						return _this.setMuted(false);
					},
				});
			} else {
				muteButton = React.createElement(IconButton, {
					variant: 'sound',
					tooltip: 'Mute',
					onClick: function() {
						return _this.setMuted(true);
					},
				});
			}
			if (XR.isVRCapable(this.props.sceneName)) {
				if (this.state.isVRPresentationActive) {
					logger.info('VR Presentation Active');
					enterOrExitVRButton = React.createElement(IconButton, {
						variant: 'exit-vr',
						tooltip: 'Exit VR',
						onClick: function() {
							return _this.toggleVRPresentation();
						},
					});
				} else {
					logger.info('VR Presentation Inactive');
					enterOrExitVRButton = React.createElement(IconButton, {
						variant: 'enter-vr',
						tooltip: 'Enter VR',
						onClick: function() {
							return _this.toggleVRPresentation();
						},
					});
				}
			}
			if (this.state.isFullscreen) {
				screenSizeButton = React.createElement(IconButton, {
					variant: 'minimize',
					tooltip: 'Exit Fullscreen',
					onClick: function() {
						return _this.minimize();
					},
				});
			} else {
				screenSizeButton = React.createElement(IconButton, {
					variant: 'maximize',
					tooltip: 'Fullscreen',
					onClick: function() {
						return _this.maximize();
					},
				});
			}
		}
		return React.createElement(
			'div',
			{
				id: SCENE_CONTAINER_DOM_ID,
				className: AmplifyUI.sumerianSceneContainer,
				'data-test': sumerianScene.container,
			},
			React.createElement(
				'div',
				{
					id: SCENE_DOM_ID,
					className: AmplifyUI.sumerianScene,
					'data-test': sumerianScene.sumerianScene,
				},
				this.state.loading &&
					React.createElement(Loading, {
						sceneName: this.props.sceneName,
						percentage: this.state.percentage,
						sceneError: this.state.sceneError,
					})
			),
			React.createElement(
				'div',
				{ className: AmplifyUI.sceneBar, 'data-test': sumerianScene.bar },
				React.createElement(
					'span',
					{
						className: AmplifyUI.sceneActions,
						'data-test': sumerianScene.actions,
					},
					muteButton,
					enterOrExitVRButton,
					screenSizeButton
				)
			)
		);
	};
	return SumerianScene;
})(React.Component);
export default SumerianScene;
//# sourceMappingURL=SumerianScene.js.map
