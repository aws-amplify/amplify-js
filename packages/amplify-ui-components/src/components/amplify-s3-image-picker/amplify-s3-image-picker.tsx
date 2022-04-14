import { Component, Prop, h, State, Host } from '@stencil/core';
import { Logger, I18n } from '@aws-amplify/core';
import { AccessLevel } from '../../common/types/storage-types';
import {
	calcKey,
	getStorageObject,
	putStorageObject,
} from '../../common/storage-helpers';
import { Translations } from '../../common/Translations';

const logger = new Logger('S3ImagePicker');

@Component({
	tag: 'amplify-s3-image-picker',
})
export class AmplifyS3ImagePicker {
	/** String representing directory location to image file */
	@Prop() path: string;
	/** The content type header used when uploading to S3 */
	@Prop() contentType: string = 'binary/octet-stream';
	/** The access level of the image */
	@Prop() level: AccessLevel = AccessLevel.Public;
	/** Whether or not to use track the get/put of the image */
	@Prop() track: boolean;
	/** Cognito identity id of the another user's image */
	@Prop() identityId: string;
	/** Callback used to generate custom key value */
	@Prop() fileToKey: (data: object) => string | string;
	/** Title string value */
	@Prop() headerTitle?: string = Translations.IMAGE_PICKER_TITLE;
	/** Header Hint value in string */
	@Prop() headerHint?: string = Translations.IMAGE_PICKER_HINT;
	/** Placeholder hint that goes under the placeholder image */
	@Prop() placeholderHint?: string = Translations.IMAGE_PICKER_PLACEHOLDER_HINT;
	/** Upload Button Text as string */
	@Prop() buttonText?: string = Translations.IMAGE_PICKER_BUTTON_TEXT;
	/** Source for the image */
	@State() src: string | object;

	private handlePick = async (file: File) => {
		const { path = '', level, track, identityId, fileToKey } = this;
		const key = path + calcKey(file, fileToKey);

		try {
			await putStorageObject(key, file, level, track, file['type'], logger);

			this.src = await getStorageObject(key, level, track, identityId, logger);
		} catch (error) {
			logger.error(error);
			throw new Error(error);
		}
	};

	render() {
		return (
			<Host>
				<slot name="photo-picker">
					<amplify-photo-picker
						previewSrc={this.src}
						handleClick={this.handlePick}
						headerTitle={I18n.get(this.headerTitle)}
						headerHint={I18n.get(this.headerHint)}
						placeholderHint={I18n.get(this.placeholderHint)}
						buttonText={I18n.get(this.buttonText)}
					></amplify-photo-picker>
				</slot>
			</Host>
		);
	}
}
