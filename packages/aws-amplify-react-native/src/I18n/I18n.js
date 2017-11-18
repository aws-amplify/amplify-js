/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { ConsoleLogger as Logger } from '../Common/Logger';

const logger = new Logger('I18nClass');

/**
 * Language transition class
 */
class I18nClass {
    /**
     * @param {Object} options 
     */
    constructor(config) {
        this.configure(config);

        this._lang = this._config.language;
        if (!this._lang && (typeof window !== 'undefined') && window.navigator) {
            this._lang = window.navigator.language;
        }
        logger.debug('language: ', this._lang);

        this._dict = {};
    }

    /**
     * Configure I18n part
     * @param {Object} config
     * @return {Object} - Current configuration
     */
    configure(config) {
        logger.debug('configure I18n');
        this._config = Object.assign(
            {},
            this._config,
            config? config.I18n || config : null
        );

        return this._config;
    }

    /**
     * Explicitly setting language
     * @param {String} lang 
     */
    setLanguage(lang) {
        this._lang = lang;
    }

    /**
     * Get value
     * @param {String} key 
     * @param {String} [defVal] - Default value
     * @return {String} - value of the key
     */
    get(key, defVal=undefined) {
        if (!this._lang) {
            return (typeof defVal !== 'undefined')? defVal : key;
        }

        const lang = this._lang;
        let val = this.getByLanguage(key, lang);
        if (val) { return val; }

        if (lang.indexOf('-') > 0) {
            val = this.getByLanguage(key, lang.split('-')[0]);
        }
        if (val) { return val; }

        return (typeof defVal !== 'undefined')? defVal : key;
    }

    /**
     * Get value according to specified language
     * @param {String} key 
     * @param {String} language - Specified langurage to be used
     * @param {String} defVal - Default value
     * @return {String} - The corresponding value of the key from dictionary
     */
    getByLanguage(key, language, defVal=null) {
        if (!language) { return defVal; }

        const lang_dict = this._dict[language];
        if (!lang_dict) { return defVal; }

        return lang_dict[key];
    }

    /**
     * Add vocabularies for one language
     * @param {String} langurage - Language of the dictionary
     * @param {Object} vocabularies - Object that has key-value as dictionary entry
     */
    putVocabulariesForLanguage(language, vocabularies) {
        let lang_dict = this._dict[language];
        if (!lang_dict) { lang_dict = this._dict[language] = {} }
        Object.assign(lang_dict, vocabularies);
    }

    /**
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

export default I18nClass;
