import { Component, Prop, h, State, Watch } from '@stencil/core';
import { Logger, I18n } from '@aws-amplify/core';
import { AccessLevel } from '../../common/types/storage-types';
import { getTextSource, putStorageObject } from '../../common/storage-helpers';
import { Translations } from '../../common/Translations';

const logger = new Logger('S3Text');

@Component({
	tag: 'amplify-s3-text',
	styleUrl: 'amplify-s3-text.scss',
	shadow: true,
})
export class AmplifyS3Text {
	/** The key of the text object in S3 */
	@Prop() textKey: string;
	/** String representing directory location to text file */
	@Prop() path: string;
	/** Text body content to be uploaded */
	@Prop() body: object;
	/** The content type header used when uploading to S3 */
	@Prop() contentType: string = 'text/*';
	/** The access level of the text file */
	@Prop() level: AccessLevel = AccessLevel.Public;
	/** Whether or not to use track the get/put of the text file */
	@Prop() track: boolean;
	/** Cognito identity id of the another user's text file */
	@Prop() identityId: string;
	/** Fallback content */
	@Prop() fallbackText: string = Translations.TEXT_FALLBACK_CONTENT;
	/** Source content of text */
	@State() src: string;

	@Watch('textKey')
	@Watch('body')
	async watchHandler() {
		await this.load();
	}

	async componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);

		await this.load();
	}

	private async load() {
		const { path, textKey, body, contentType, level, track, identityId } = this;
		if (!textKey && !path) {
			logger.debug('empty textKey and path');
			return;
		}

		const key = textKey || path;
		logger.debug('loading ' + key + '...');

		if (body) {
			await putStorageObject(textKey, body, level, track, contentType, logger);
		}
		try {
			this.src = await getTextSource(key, level, track, identityId, logger);
		} catch (err) {
			logger.debug(err);
			throw new Error(err);
		}
	}

	render() {
		return (
			<div>
				<div class="text-container">
					{this.src ? (
						<pre>{this.src}</pre>
					) : (
						<pre>{I18n.get(this.fallbackText)}</pre>
					)}
				</div>
			</div>
		);
	}
}
