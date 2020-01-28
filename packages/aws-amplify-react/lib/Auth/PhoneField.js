'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var Amplify_UI_Theme_1 = require('../Amplify-UI/Amplify-UI-Theme');
var country_dial_codes_1 = require('./common/country-dial-codes');
var core_1 = require('@aws-amplify/core');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var PhoneField = /** @class */ (function(_super) {
	__extends(PhoneField, _super);
	function PhoneField(props) {
		var _this = _super.call(this, props) || this;
		_this.handleInputChange = _this.handleInputChange.bind(_this);
		_this.composePhoneNumber = _this.composePhoneNumber.bind(_this);
		_this.inputs = {
			dial_code: _this.props.defaultDialCode || '+1',
			phone_line_number: '',
		};
		return _this;
	}
	PhoneField.prototype.composePhoneNumber = function(
		dial_code,
		phone_line_number
	) {
		return '' + (dial_code || '+1') + phone_line_number.replace(/[-()]/g, '');
	};
	PhoneField.prototype.handleInputChange = function(evt) {
		var _a = evt.target,
			name = _a.name,
			value = _a.value;
		this.inputs[name] = value;
		if (this.props.onChangeText) {
			this.props.onChangeText(
				this.composePhoneNumber(
					this.inputs.dial_code,
					this.inputs.phone_line_number
				)
			);
		}
	};
	PhoneField.prototype.render = function() {
		var _a = this.props,
			_b = _a.theme,
			theme = _b === void 0 ? Amplify_UI_Theme_1.default : _b,
			_c = _a.required,
			required = _c === void 0 ? true : _c,
			_d = _a.defaultDialCode,
			defaultDialCode = _d === void 0 ? '+1' : _d,
			_e = _a.label,
			label = _e === void 0 ? 'Phone Number' : _e,
			_f = _a.placeholder,
			placeholder = _f === void 0 ? 'Enter your phone number' : _f;
		return React.createElement(
			Amplify_UI_Components_React_1.FormField,
			{ theme: theme, key: 'phone_number' },
			required
				? React.createElement(
						Amplify_UI_Components_React_1.InputLabel,
						{ theme: theme },
						core_1.I18n.get(label),
						' *'
				  )
				: React.createElement(
						Amplify_UI_Components_React_1.InputLabel,
						{ theme: theme },
						core_1.I18n.get(label)
				  ),
			React.createElement(
				Amplify_UI_Components_React_1.SelectInput,
				{ theme: theme },
				React.createElement(
					'select',
					{
						name: 'dial_code',
						defaultValue: defaultDialCode,
						onChange: this.handleInputChange,
						'data-test':
							data_test_attributes_1.auth.genericAttrs.dialCodeSelect,
					},
					country_dial_codes_1.default.map(function(dialCode) {
						return React.createElement(
							'option',
							{ key: dialCode, value: dialCode },
							dialCode
						);
					})
				),
				React.createElement(Amplify_UI_Components_React_1.Input, {
					placeholder: core_1.I18n.get(placeholder),
					theme: theme,
					type: 'tel',
					id: 'phone_line_number',
					key: 'phone_line_number',
					name: 'phone_line_number',
					onChange: this.handleInputChange,
					'data-test':
						data_test_attributes_1.auth.genericAttrs.phoneNumberInput,
				})
			)
		);
	};
	return PhoneField;
})(React.Component);
exports.PhoneField = PhoneField;
exports.default = PhoneField;
//# sourceMappingURL=PhoneField.js.map
