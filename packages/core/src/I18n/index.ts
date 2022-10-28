// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
