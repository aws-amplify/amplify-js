// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '../Logger';
import { Amplify } from '../singleton';
import { I18nOptions } from './types';

const logger = new Logger('I18n');

/**
 * Language translation utility.
 */
export class I18n {
	/**
	 * @private
	 */
	_options: I18nOptions | null = null;

	/**
	 * @private
	 */
	_lang?: string | null = null;

	/**
	 * @private
	 */
	_dict: Record<string, any> = {};

	/**
	 * @constructor
	 * Initialize with configurations
	 * @param {Object} options
	 */
	constructor() {}

	/**
	 * Sets the default language from the configuration when required.
	 */
	setDefaultLanguage() {
		if (!this._lang) {
			const i18nConfig = Amplify.getConfig().I18n;
			this._lang = i18nConfig?.language;
		}

		// Default to window language if not set in config
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
	get(key: string, defVal: string | undefined = undefined) {
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
	getByLanguage(key: string, language: string, defVal: string | null = null) {
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
	putVocabulariesForLanguage(
		language: string,
		vocabularies: Record<string, any>
	) {
		let lang_dict = this._dict[language];
		if (!lang_dict) {
			lang_dict = this._dict[language] = {};
		}
		this._dict[language] = { ...lang_dict, ...vocabularies };
	}

	/**
	 * @method
	 * Add vocabularies for one language
	 * @param {Object} vocabularies - Object that has language as key,
	 *                                vocabularies of each language as value
	 */
	putVocabularies(vocabularies: Record<string, any>) {
		Object.keys(vocabularies).map(key => {
			this.putVocabulariesForLanguage(key, vocabularies[key]);
		});
	}
}
