import { Amplify, httpClient } from '@aws-amplify/core';
import { v4 as uuid } from 'uuid';
export async function translateText({ text, sourceLanguage, targetLanguage }) {
	const { predictions } = Amplify.getConfig();

	if (predictions && predictions.convert && predictions.convert.translateText) {
		const { region, defaults } = predictions.convert.translateText;
		const result = await httpClient({
			endpoint: `https://translate.${region}.amazonaws.com/`,
			authMode: 'SigV4',
			headers: {
				'x-amz-target': 'AWSShineFrontendService_20170701.TranslateText',
				'amz-sdk-invocation-id': uuid(),
				'amz-sdk-request': 'attempt=1; max=3',
				'x-amz-user-agent': 'amplify test',
			},
			method: 'POST',
			region,
			service: 'translate',
			body: {
				SourceLanguageCode: sourceLanguage,
				TargetLanguageCode: targetLanguage,
				Text: text,
			},
		});

		return result;
	}
	return text;
}
