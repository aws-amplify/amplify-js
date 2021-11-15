import { Component, Prop, h, State, Host } from '@stencil/core';
import { Logger, I18n } from '@aws-amplify/core';
import { AccessLevel } from '../../common/types/storage-types';
import { calcKey, putStorageObject } from '../../common/storage-helpers';
import { Translations } from '../../common/Translations';

const logger = new Logger('S3TextPicker');

@Component({
	tag: 'amplify-s3-text-picker',
	shadow: true,
})
export class AmplifyS3TextPicker {
	/** String representing directory location to text file */
	@Prop() path: string;
	/** The content type header used when uploading to S3 */
	@Prop() contentType: string = 'text/*';
	/** The access level of the text file */
	@Prop() level: AccessLevel = AccessLevel.Public;
	/** Whether or not to use track the get/put of the text file */
	@Prop() track: boolean;
	/** Cognito identity id of the another user's text file */
	@Prop() identityId: string;
	/** Callback used to generate custom key value */
	@Prop() fileToKey: (data: object) => string | string;
	/** Fallback content for aplify-s3-text */
	@Prop() fallbackText: string = Translations.PICKER_TEXT;
	/** Source content of text */
	@State() src: string;

	private async handleInput(event: Event) {
		const file = (event.target as HTMLInputElement).files[0];

		const { path = '', level, fileToKey, track } = this;
		const key = path + calcKey(file, fileToKey);

		if (!file) {
			throw new Error('No file was selected');
		}

		try {
			await putStorageObject(key, file, level, track, file['type'], logger);
			this.src = key;
		} catch (error) {
			logger.debug(error);
			throw new Error(error);
		}
	}

	render() {
		return (
			<Host>
				<amplify-s3-text
					textKey={this.src}
					path={this.path}
					level={this.level}
					track={this.track}
					identityId={this.identityId}
					contentType={this.contentType}
					fallbackText={I18n.get(this.fallbackText)}
				/>
				<amplify-picker
					inputHandler={(e) => this.handleInput(e)}
					acceptValue={'text/*'}
				></amplify-picker>
			</Host>
		);
	}
}
