// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { I18nOptions } from './types';
import { ConsoleLogger as Logger } from '../Logger';

const logger = new Logger('I18n');

/**
 * Language transition class
 */
export class I18n {
	/**
	 * @private
	 */
	_options: I18nOptions = null;

	/**
	 * @private
	 */
	_lang = null;

	/**
	 * @private
	 */
	_dict = {};

	/**
	 * @constructor
	 * Initialize with configurations
	 * @param {Object} options
	 */
	constructor(options: I18nOptions) {
		this._options = Object.assign({}, options);
		this._lang = this._options.language;

		if (
			!this._lang &&
			typeof window !== 'undefined' &&
			window &&
			window.navigator
		) {
			this._lang = window.navigator.language;
		}

		logger.debug(this._lang);
	}

	/**
	 * @method
	 * Explicitly setting language
	 * @param {String} lang
	 */
	setLanguage(lang: string) {
		this._lang = lang;
	}

	/**
	 * @method
	 * Get value
	 * @param {String} key
	 * @param {String} defVal - Default value
	 */
	get(key, defVal = undefined) {
		if (!this._lang) {
			return typeof defVal !== 'undefined' ? defVal : key;
		}

		const lang = this._lang;
		let val = this.getByLanguage(key, lang);
		if (val) {
			return val;
		}

		if (lang.indexOf('-') > 0) {
			val = this.getByLanguage(key, lang.split('-')[0]);
		}
		if (val) {
			return val;
		}

		return typeof defVal !== 'undefined' ? defVal : key;
	}

	/**
	 * @method
	 * Get value according to specified language
	 * @param {String} key
	 * @param {String} language - Specified langurage to be used
	 * @param {String} defVal - Default value
	 */
	getByLanguage(key, language, defVal = null) {
		if (!language) {
			return defVal;
		}

		const lang_dict = this._dict[language];
		if (!lang_dict) {
			return defVal;
		}

		return lang_dict[key];
	}

	/**
	 * @method
	 * Add vocabularies for one language
	 * @param {String} language - Language of the dictionary
	 * @param {Object} vocabularies - Object that has key-value as dictionary entry
	 */
	putVocabulariesForLanguage(language, vocabularies) {
		let lang_dict = this._dict[language];
		if (!lang_dict) {
			lang_dict = this._dict[language] = {};
		}
		Object.assign(lang_dict, vocabularies);
	}

	/**
	 * @method
	 * Add vocabularies for one language
	 * @param {Object} vocabularies - Object that has language as key,
	 *                                vocabularies of each language as value
	 */
	putVocabularies(vocabularies) {
		Object.keys(vocabularies).map(key => {
			this.putVocabulariesForLanguage(key, vocabularies[key]);
		});
	}
}
