// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { I18n as I18nClass } from './I18n';

import { ConsoleLogger as Logger } from '../Logger';
import { Amplify } from '../Amplify';

const logger = new Logger('I18n');

let _config = null;
let _i18n = null;

/**
 * Export I18n APIs
 */
export class I18n {
	/**
	 * @static
	 * @method
	 * Configure I18n part
	 * @param {Object} config - Configuration of the I18n
	 */
	static configure(config) {
		logger.debug('configure I18n');
		if (!config) {
			return _config;
		}

		_config = Object.assign({}, _config, config.I18n || config);

		I18n.createInstance();

		return _config;
	}

	static getModuleName() {
		return 'I18n';
	}

	/**
	 * @static
	 * @method
	 * Create an instance of I18n for the library
	 */
	static createInstance() {
		logger.debug('create I18n instance');
		if (_i18n) {
			return;
		}
		_i18n = new I18nClass(_config);
	}

	/**
	 * @static @method
	 * Explicitly setting language
	 * @param {String} lang
	 */
	static setLanguage(lang) {
		I18n.checkConfig();

		return _i18n.setLanguage(lang);
	}

	/**
	 * @static @method
	 * Get value
	 * @param {String} key
	 * @param {String} defVal - Default value
	 */
	static get(key, defVal?) {
		if (!I18n.checkConfig()) {
			return typeof defVal === 'undefined' ? key : defVal;
		}

		return _i18n.get(key, defVal);
	}

	/**
	 * @static
	 * @method
	 * Add vocabularies for one language
	 * @param {String} langurage - Language of the dictionary
	 * @param {Object} vocabularies - Object that has key-value as dictionary entry
	 */
	static putVocabulariesForLanguage(language, vocabularies) {
		I18n.checkConfig();

		return _i18n.putVocabulariesForLanguage(language, vocabularies);
	}

	/**
	 * @static
	 * @method
	 * Add vocabularies for one language
	 * @param {Object} vocabularies - Object that has language as key,
	 *                                vocabularies of each language as value
	 */
	static putVocabularies(vocabularies) {
		I18n.checkConfig();

		return _i18n.putVocabularies(vocabularies);
	}

	public static checkConfig() {
		if (!_i18n) {
			_i18n = new I18nClass(_config);
		}

		return true;
	}
}

Amplify.register(I18n);
