// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '../Logger';
import { AmplifyV6 } from '../singleton';

const logger = new Logger('I18n');

/**
 * Language translation utility.
 * 
 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
 */
export class I18n {
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
	 * 
	 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
	 */
	constructor() {
		const i18nConfig = AmplifyV6.getConfig().I18n;
		this._lang = i18nConfig?.language;

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
	 * 
	 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
	 */
	setLanguage(lang: string) {
		this._lang = lang;
	}

	/**
	 * @method
	 * Get value
	 * @param {String} key
	 * @param {String} defVal - Default value
	 * 
	 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
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
	 * 
	 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
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
	 * 
	 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
	 */
	putVocabulariesForLanguage(language, vocabularies) {
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
	 * 
	 * @deprecated The I18n utility is on a deprecation path and will be removed in a future version of Amplify.
	 */
	putVocabularies(vocabularies) {
		Object.keys(vocabularies).map(key => {
			this.putVocabulariesForLanguage(key, vocabularies[key]);
		});
	}
}
