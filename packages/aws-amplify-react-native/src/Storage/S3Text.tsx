import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Storage, Logger, I18n } from 'aws-amplify';

import AmplifyTheme, { AmplifyThemeType } from '../AmplifyTheme';
import { AccessLevel } from './common/types';

const logger = new Logger('Storage.S3Text');

interface IS3TextProps {
	textKey?: string;
	path?: string;
	body?: string;
	contentType?: string;
	level?: AccessLevel;
	track?: boolean;
	identityId?: string;
	fallbackText?: string;
	style?: StyleProp<TextStyle>;
	theme?: AmplifyThemeType;
}

export const S3Text = ({
	textKey,
	path,
	body,
	contentType = 'text/*',
	level = AccessLevel.Public,
	track,
	identityId,
	fallbackText = 'Fallback Content',
	style,
	theme = AmplifyTheme,
}: IS3TextProps) => {
	const { text, error } = useS3Text({
		textKey,
		path,
		level,
		track,
		identityId,
		body,
		contentType,
	});

	const textStyle = Object.assign(
		{},
		StyleSheet.flatten(theme.storageText),
		style
	);

	return <Text style={textStyle}>{error ? I18n.get(fallbackText) : text}</Text>;
};

interface IUseS3TextProps {
	textKey?: string;
	path?: string;
	level: AccessLevel;
	track?: boolean;
	identityId?: string;
	body?: string;
	contentType: string;
}

interface UseS3TextState {
	text?: string;
	loading: boolean;
	error?: Error;
}

export const useS3Text = ({
	textKey,
	path,
	level = AccessLevel.Public,
	track,
	identityId = '',
	body,
	contentType = 'text/*',
}: IUseS3TextProps): UseS3TextState => {
	if (!textKey && !path) {
		logger.debug('empty textKey and path');
		return {
			error: new Error('empty textKey and path'),
			loading: false,
		};
	}

	const key = (textKey ?? path) as string;

	const [state, setState] = useState<UseS3TextState>({ loading: true });

	useEffect(() => {
		(async () => {
			logger.debug(`loading ${key}...`);

			if (!state.loading) {
				setState({ loading: true });
			}

			if (body && textKey) {
				try {
					const data = await Storage.put(textKey, body, {
						contentType,
						level,
						track,
					});

					logger.debug('uploading data:', data);
				} catch (error) {
					logger.error(error);
					setState({ error: error, loading: false });
					return;
				}
			}

			try {
				const source = await getTextSource(
					key,
					level,
					identityId,
					logger,
					track
				);

				setState({ text: source, loading: false });
			} catch (error) {
				logger.error(error);
				setState({ error: error, loading: false });
			}
		})();
	}, [textKey, path, body]);

	return state;
};

// helper methods from /packages/amplify-ui-components/src/common/storage-helpers.ts

const readFileAsync = (blob: Blob) => {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			reject('Failed to read file!');
			reader.abort();
		};

		reader.readAsText(blob);
	});
};

export const getTextSource = async (
	key: string,
	level: AccessLevel,
	identityId: string,
	logger: Logger,
	track: boolean
) => {
	if (!Storage || typeof Storage.get !== 'function') {
		throw new Error(
			'No Storage module found, please ensure @aws-amplify/storage is imported'
		);
	}
	try {
		const textSrc = await Storage.get(key, {
			download: true,
			level,
			track,
			identityId,
		});

		logger.debug(textSrc);
		let text = (await readFileAsync(textSrc['Body'])) as string;
		return text;
	} catch (error) {
		throw new Error(error);
	}
};
