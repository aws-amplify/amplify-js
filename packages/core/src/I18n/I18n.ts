// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../Logger';

import { I18nConfig } from './types';

const logger = new ConsoleLogger('I18n');

/**
 * Language translation utility.
 */
export class I18n {
	/**
	 * @private
	 */
	_options: I18nConfig | null = null;

	/**
	 * @private
	 */
	_lang?: string | null = null;

	/**
	 * @private
	 */
	_dict: Record<string, any> = {};

	/**
	 * Sets the default language from the configuration when required.
	 */
	setDefaultLanguage() {
		// Default to window language if not set in instance
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
		this.setDefaultLanguage();

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

		const langDict = this._dict[language];
		if (!langDict) {
			return defVal;
		}

		return langDict[key];
	}

	/**
	 * @method
	 * Add vocabularies for one language
	 * @param {String} language - Language of the dictionary
	 * @param {Object} vocabularies - Object that has key-value as dictionary entry
	 */
	putVocabulariesForLanguage(
		language: string,
		vocabularies: Record<string, any>,
	) {
		let langDict = this._dict[language];
		if (!langDict) {
			langDict = this._dict[language] = {};
		}
		this._dict[language] = { ...langDict, ...vocabularies };
	}

	/**
	 * @method
	 * Add vocabularies for one language
	 * @param {Object} vocabularies - Object that has language as key,
	 *                                vocabularies of each language as value
	 */
	putVocabularies(vocabularies: Record<string, Record<string, string>>) {
		Object.keys(vocabularies).forEach(key => {
			this.putVocabulariesForLanguage(key, vocabularies[key]);
		});
	}
}
