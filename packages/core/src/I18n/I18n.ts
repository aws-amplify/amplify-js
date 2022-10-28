// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	putVocabularies(vocabularies) {
		Object.keys(vocabularies).map(key => {
			this.putVocabulariesForLanguage(key, vocabularies[key]);
		});
	}
}
