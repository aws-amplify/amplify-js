import React, { useState } from 'react';
import {
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	View,
	ImageBackground,
} from 'react-native';

import { I18n, Storage, Logger } from 'aws-amplify';
import {
	launchCameraAsync,
	launchImageLibraryAsync,
	MediaTypeOptions,
	ImagePickerResult,
} from 'expo-image-picker';
import { Buffer } from 'buffer';
import Icon from 'react-native-vector-icons/FontAwesome';

import AmplifyTheme, {
	AmplifyThemeType,
	placeholderColor,
} from '../AmplifyTheme';

import { AccessLevel } from './common/types';

const logger = new Logger('Storage.S3ImagePicker');

interface IS3ImagePickerProps {
	path?: string;
	level?: AccessLevel;
	track?: boolean;
	identityId?: string;
	fileToKey?: (data: object) => string | string;
	alertTitle?: string;
	takePhotoButtonText?: string;
	choosePhotoButtonText?: string;
	cancelButtonText?: string;
	allowsEditing?: boolean;
	theme?: AmplifyThemeType;
}

export const S3ImagePicker = ({
	path = '',
	level = AccessLevel.Public,
	track,
	fileToKey,
	alertTitle = 'Add profile photo',
	takePhotoButtonText = 'Take Photo',
	choosePhotoButtonText = 'Choose From Library',
	cancelButtonText = 'Cancel',
	allowsEditing = true,
	theme = AmplifyTheme,
}: IS3ImagePickerProps) => {
	const [source, setSource] = useState<string>();
	const [loading, setLoading] = useState<boolean>(false);

	const handlePick = async (result: ImagePickerResult) => {
		if (result.cancelled || !result.base64) {
			logger.debug('image picker canceled');
			return;
		}

		setLoading(true);

		const key =
			path +
			calcKey(
				{ uri: result.uri, height: result.height, width: result.width },
				fileToKey
			);

		logger.debug(`uploading ${key}...`);

		try {
			await Storage.put(key, new Buffer(result.base64, 'base64'), {
				contentType: 'image/*',
				level,
				track,
			});
		} catch (error) {
			logger.error(error);
			return;
		}

		setLoading(false);
		setSource(result.uri);
	};

	return (
		<TouchableOpacity
			onPress={showImagePicker}
			style={{ alignItems: 'center', justifyContent: 'center' }}
		>
			<ImageBackground
				style={{
					width: theme.imagePicker.width,
					height: theme.imagePicker.height,
				}}
				imageStyle={theme.imagePicker}
				source={{ uri: source }}
			>
				<View
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
						width: '100%',
					}}
				>
					{loading && !source && <ActivityIndicator />}
					{!loading && !source && (
						<Icon name="camera" size={30} color={placeholderColor} />
					)}
				</View>
			</ImageBackground>
		</TouchableOpacity>
	);

	function showImagePicker() {
		Alert.alert(I18n.get(alertTitle), undefined, [
			{
				text: I18n.get(takePhotoButtonText),
				onPress: async () => {
					logger.debug('Opening camera...');

					const result = await launchCameraAsync({
						mediaTypes: MediaTypeOptions.Images,
						allowsEditing,
						aspect: [1, 1],
						quality: 1,
						base64: true,
					});

					handlePick(result);
				},
			},
			{
				text: I18n.get(choosePhotoButtonText),
				onPress: async () => {
					logger.debug('Opening library...');

					const result = await launchImageLibraryAsync({
						mediaTypes: MediaTypeOptions.Images,
						allowsEditing,
						aspect: [1, 1],
						quality: 1,
						base64: true,
					});

					handlePick(result);
				},
			},
			{
				text: I18n.get(cancelButtonText),
				style: 'cancel',
			},
		]);
	}
};

const calcKey = (
	{ uri, height, width }: { uri: string; height: number; width: number },
	fileToKey?: (data: object) => string | string
) => {
	let key = uri.replace(/^.*[\\\/]/, '');

	if (fileToKey) {
		if (typeof fileToKey === 'string') {
			key = fileToKey;
		} else if (typeof fileToKey === 'function') {
			key = fileToKey({ uri, height, width });
		} else {
			key = encodeURI(JSON.stringify(fileToKey));
		}
		if (!key) {
			key = 'empty_key';
		}
	}

	return key.replace(/\s/g, '_');
};
