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
var __spreadArrays =
	(this && this.__spreadArrays) ||
	function() {
		for (var s = 0, i = 0, il = arguments.length; i < il; i++)
			s += arguments[i].length;
		for (var r = Array(s), k = 0, i = 0; i < il; i++)
			for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
				r[k] = a[j];
		return r;
	};
import * as React from 'react';
import { Component } from 'react';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
} from '../AmplifyUI';
import { Input, Button } from '../AmplifyTheme';
import { I18n } from '@aws-amplify/core';
import Interactions from '@aws-amplify/interactions';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
var logger = new Logger('ChatBot');
// @ts-ignore
var styles = {
	itemMe: {
		padding: 10,
		fontSize: 12,
		color: 'gray',
		marginTop: 4,
		textAlign: 'right',
	},
	itemBot: {
		fontSize: 12,
		textAlign: 'left',
	},
	list: {
		height: '300px',
		overflow: 'auto',
	},
	textInput: Object.assign({}, Input, {
		display: 'inline-block',
		width: 'calc(100% - 90px - 15px)',
	}),
	// @ts-ignore
	button: Object.assign({}, Button, {
		width: '60px',
		float: 'right',
	}),
	// @ts-ignore
	mic: Object.assign({}, Button, {
		width: '40px',
		float: 'right',
	}),
};
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
var audioControl;
var ChatBot = /** @class */ (function(_super) {
	__extends(ChatBot, _super);
	function ChatBot(props) {
		var _this = _super.call(this, props) || this;
		if (_this.props.voiceEnabled) {
			require('./aws-lex-audio');
			// @ts-ignore
			audioControl = new global.LexAudio.audioControl();
		}
		if (!_this.props.textEnabled && _this.props.voiceEnabled) {
			STATES.INITIAL.MESSAGE = 'Click the mic button';
			styles.textInput = Object.assign({}, Input, {
				display: 'inline-block',
				width: 'calc(100% - 40px - 15px)',
			});
		}
		if (_this.props.textEnabled && !_this.props.voiceEnabled) {
			STATES.INITIAL.MESSAGE = 'Type a message';
			styles.textInput = Object.assign({}, Input, {
				display: 'inline-block',
				width: 'calc(100% - 60px - 15px)',
			});
		}
		if (!_this.props.voiceConfig.silenceDetectionConfig) {
			throw new Error('voiceConfig prop is missing silenceDetectionConfig');
		}
		_this.state = {
			dialog: [
				{
					message: _this.props.welcomeMessage || 'Welcome to Lex',
					from: 'system',
				},
			],
			inputText: '',
			currentVoiceState: STATES.INITIAL,
			inputDisabled: false,
			micText: STATES.INITIAL.ICON,
			continueConversation: false,
			micButtonDisabled: false,
		};
		_this.micButtonHandler = _this.micButtonHandler.bind(_this);
		_this.changeInputText = _this.changeInputText.bind(_this);
		_this.listItems = _this.listItems.bind(_this);
		_this.submit = _this.submit.bind(_this);
		// @ts-ignore
		_this.listItemsRef = React.createRef();
		_this.onSilenceHandler = _this.onSilenceHandler.bind(_this);
		_this.doneSpeakingHandler = _this.doneSpeakingHandler.bind(_this);
		_this.lexResponseHandler = _this.lexResponseHandler.bind(_this);
		return _this;
	}
	ChatBot.prototype.micButtonHandler = function() {
		return __awaiter(this, void 0, void 0, function() {
			var _this = this;
			return __generator(this, function(_a) {
				if (this.state.continueConversation) {
					this.reset();
				} else {
					this.setState(
						{
							inputDisabled: true,
							continueConversation: true,
							currentVoiceState: STATES.LISTENING,
							micText: STATES.LISTENING.ICON,
							micButtonDisabled: false,
						},
						function() {
							audioControl.startRecording(
								_this.onSilenceHandler,
								null,
								_this.props.voiceConfig.silenceDetectionConfig
							);
						}
					);
				}
				return [2 /*return*/];
			});
		});
	};
	ChatBot.prototype.onSilenceHandler = function() {
		var _this = this;
		audioControl.stopRecording();
		if (!this.state.continueConversation) {
			return;
		}
		audioControl.exportWAV(function(blob) {
			_this.setState(
				{
					currentVoiceState: STATES.SENDING,
					audioInput: blob,
					micText: STATES.SENDING.ICON,
					micButtonDisabled: true,
				},
				function() {
					_this.lexResponseHandler();
				}
			);
		});
	};
	ChatBot.prototype.lexResponseHandler = function() {
		return __awaiter(this, void 0, void 0, function() {
			var interactionsMessage, response;
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						if (!Interactions || typeof Interactions.send !== 'function') {
							throw new Error(
								'No Interactions module found, please ensure @aws-amplify/interactions is imported'
							);
						}
						if (!this.state.continueConversation) {
							return [2 /*return*/];
						}
						interactionsMessage = {
							content: this.state.audioInput,
							options: {
								messageType: 'voice',
							},
						};
						return [
							4 /*yield*/,
							Interactions.send(this.props.botName, interactionsMessage),
						];
					case 1:
						response = _a.sent();
						this.setState(
							{
								lexResponse: response,
								currentVoiceState: STATES.SPEAKING,
								micText: STATES.SPEAKING.ICON,
								micButtonDisabled: true,
								dialog: __spreadArrays(this.state.dialog, [
									// @ts-ignore
									{ message: response.inputTranscript, from: 'me' },
									// @ts-ignore
									response && { from: 'bot', message: response.message },
								]),
								inputText: '',
							},
							function() {
								_this.doneSpeakingHandler();
							}
						);
						this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
						return [2 /*return*/];
				}
			});
		});
	};
	ChatBot.prototype.doneSpeakingHandler = function() {
		var _this = this;
		if (!this.state.continueConversation) {
			return;
		}
		if (this.state.lexResponse.contentType === 'audio/mpeg') {
			audioControl.play(this.state.lexResponse.audioStream, function() {
				if (
					_this.state.lexResponse.dialogState === 'ReadyForFulfillment' ||
					_this.state.lexResponse.dialogState === 'Fulfilled' ||
					_this.state.lexResponse.dialogState === 'Failed' ||
					!_this.props.conversationModeOn
				) {
					_this.setState({
						inputDisabled: false,
						currentVoiceState: STATES.INITIAL,
						micText: STATES.INITIAL.ICON,
						micButtonDisabled: false,
						continueConversation: false,
					});
				} else {
					_this.setState(
						{
							currentVoiceState: STATES.LISTENING,
							micText: STATES.LISTENING.ICON,
							micButtonDisabled: false,
						},
						function() {
							audioControl.startRecording(
								_this.onSilenceHandler,
								null,
								_this.props.voiceConfig.silenceDetectionConfig
							);
						}
					);
				}
			});
		} else {
			this.setState({
				inputDisabled: false,
				currentVoiceState: STATES.INITIAL,
				micText: STATES.INITIAL.ICON,
				micButtonDisabled: false,
				continueConversation: false,
			});
		}
	};
	ChatBot.prototype.reset = function() {
		this.setState(
			{
				inputText: '',
				currentVoiceState: STATES.INITIAL,
				inputDisabled: false,
				micText: STATES.INITIAL.ICON,
				continueConversation: false,
				micButtonDisabled: false,
			},
			function() {
				audioControl.clear();
			}
		);
	};
	ChatBot.prototype.listItems = function() {
		return this.state.dialog.map(function(m, i) {
			if (m.from === 'me') {
				return React.createElement(
					'div',
					{ key: i, style: styles.itemMe },
					m.message
				);
			} else if (m.from === 'system') {
				return React.createElement(
					'div',
					{ key: i, style: styles.itemBot },
					m.message
				);
			} else {
				return React.createElement(
					'div',
					{ key: i, style: styles.itemBot },
					m.message
				);
			}
		});
	};
	ChatBot.prototype.submit = function(e) {
		return __awaiter(this, void 0, void 0, function() {
			var response;
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						e.preventDefault();
						if (!this.state.inputText) {
							return [2 /*return*/];
						}
						return [
							4 /*yield*/,
							new Promise(function(resolve) {
								return _this.setState(
									{
										dialog: __spreadArrays(_this.state.dialog, [
											{ message: _this.state.inputText, from: 'me' },
										]),
									},
									resolve
								);
							}),
						];
					case 1:
						_a.sent();
						if (!Interactions || typeof Interactions.send !== 'function') {
							throw new Error(
								'No Interactions module found, please ensure @aws-amplify/interactions is imported'
							);
						}
						return [
							4 /*yield*/,
							Interactions.send(this.props.botName, this.state.inputText),
						];
					case 2:
						response = _a.sent();
						this.setState({
							// @ts-ignore
							dialog: __spreadArrays(this.state.dialog, [
								// @ts-ignore
								response && { from: 'bot', message: response.message },
							]),
							inputText: '',
						});
						this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
						return [2 /*return*/];
				}
			});
		});
	};
	ChatBot.prototype.changeInputText = function(event) {
		return __awaiter(this, void 0, void 0, function() {
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							this.setState({ inputText: event.target.value }),
						];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	ChatBot.prototype.getOnComplete = function(fn) {
		var _this = this;
		return function() {
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) {
				args[_i] = arguments[_i];
			}
			var clearOnComplete = _this.props.clearOnComplete;
			var message = fn.apply(void 0, args);
			_this.setState(
				{
					dialog: __spreadArrays(!clearOnComplete && _this.state.dialog, [
						message && { from: 'bot', message: message },
					]).filter(Boolean),
				},
				function() {
					_this.listItemsRef.current.scrollTop =
						_this.listItemsRef.current.scrollHeight;
				}
			);
		};
	};
	ChatBot.prototype.componentDidMount = function() {
		var _a = this.props,
			onComplete = _a.onComplete,
			botName = _a.botName;
		if (onComplete && botName) {
			if (!Interactions || typeof Interactions.onComplete !== 'function') {
				throw new Error(
					'No Interactions module found, please ensure @aws-amplify/interactions is imported'
				);
			}
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
	};
	ChatBot.prototype.componentDidUpdate = function(prevProps) {
		var _a = this.props,
			onComplete = _a.onComplete,
			botName = _a.botName;
		if (botName && this.props.onComplete !== prevProps.onComplete) {
			if (!Interactions || typeof Interactions.onComplete !== 'function') {
				throw new Error(
					'No Interactions module found, please ensure @aws-amplify/interactions is imported'
				);
			}
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
	};
	ChatBot.prototype.render = function() {
		var _a = this.props,
			title = _a.title,
			theme = _a.theme,
			onComplete = _a.onComplete;
		return React.createElement(
			FormSection,
			{ theme: theme },
			title &&
				React.createElement(SectionHeader, { theme: theme }, I18n.get(title)),
			React.createElement(
				SectionBody,
				{ theme: theme },
				React.createElement(
					'div',
					{ ref: this.listItemsRef, style: styles.list },
					this.listItems()
				)
			),
			React.createElement(
				SectionFooter,
				{ theme: theme },
				React.createElement(ChatBotInputs, {
					micText: this.state.micText,
					voiceEnabled: this.props.voiceEnabled,
					textEnabled: this.props.textEnabled,
					styles: styles,
					onChange: this.changeInputText,
					inputText: this.state.inputText,
					onSubmit: this.submit,
					inputDisabled: this.state.inputDisabled,
					micButtonDisabled: this.state.micButtonDisabled,
					handleMicButton: this.micButtonHandler,
					currentVoiceState: this.state.currentVoiceState,
				})
			)
		);
	};
	return ChatBot;
})(Component);
export { ChatBot };
function ChatBotTextInput(props) {
	var styles = props.styles;
	var onChange = props.onChange;
	var inputText = props.inputText;
	var inputDisabled = props.inputDisabled;
	var currentVoiceState = props.currentVoiceState;
	return React.createElement('input', {
		style: styles.textInput,
		type: 'text',
		placeholder: I18n.get(currentVoiceState.MESSAGE),
		onChange: onChange,
		value: inputText,
		disabled: inputDisabled,
	});
}
function ChatBotMicButton(props) {
	var voiceEnabled = props.voiceEnabled;
	var styles = props.styles;
	var micButtonDisabled = props.micButtonDisabled;
	var handleMicButton = props.handleMicButton;
	var micText = props.micText;
	if (!voiceEnabled) {
		return null;
	}
	return React.createElement(
		'button',
		{
			style: styles.mic,
			disabled: micButtonDisabled,
			onClick: handleMicButton,
		},
		micText
	);
}
function ChatBotTextButton(props) {
	var textEnabled = props.textEnabled;
	var styles = props.styles;
	var inputDisabled = props.inputDisabled;
	if (!textEnabled) {
		return null;
	}
	return React.createElement(
		'button',
		{ type: 'submit', style: styles.button, disabled: inputDisabled },
		I18n.get('Send')
	);
}
function ChatBotInputs(props) {
	var voiceEnabled = props.voiceEnabled;
	var textEnabled = props.textEnabled;
	var styles = props.styles;
	var onChange = props.onChange;
	var inputDisabled = props.inputDisabled;
	var micButtonDisabled = props.micButtonDisabled;
	var inputText = props.inputText;
	var onSubmit = props.onSubmit;
	var handleMicButton = props.handleMicButton;
	var micText = props.micText;
	var currentVoiceState = props.currentVoiceState;
	if (voiceEnabled && !textEnabled) {
		inputDisabled = true;
	}
	if (!voiceEnabled && !textEnabled) {
		return React.createElement(
			'div',
			null,
			'No Chatbot inputs enabled. Set at least one of voiceEnabled or textEnabled in the props.',
			' '
		);
	}
	return React.createElement(
		'form',
		{ onSubmit: onSubmit },
		React.createElement(ChatBotTextInput, {
			onSubmit: onSubmit,
			styles: styles,
			type: 'text',
			currentVoiceState: currentVoiceState,
			onChange: onChange,
			inputText: inputText,
			inputDisabled: inputDisabled,
		}),
		React.createElement(ChatBotTextButton, {
			onSubmit: onSubmit,
			type: 'submit',
			styles: styles,
			inputDisabled: inputDisabled,
			textEnabled: textEnabled,
		}),
		React.createElement(ChatBotMicButton, {
			styles: styles,
			micButtonDisabled: micButtonDisabled,
			handleMicButton: handleMicButton,
			micText: micText,
			voiceEnabled: voiceEnabled,
		})
	);
}
// @ts-ignore
ChatBot.defaultProps = {
	title: '',
	botName: '',
	onComplete: undefined,
	clearOnComplete: false,
	voiceConfig: defaultVoiceConfig,
	conversationModeOn: false,
	voiceEnabled: false,
	textEnabled: true,
};
export default ChatBot;
//# sourceMappingURL=ChatBot.js.map
