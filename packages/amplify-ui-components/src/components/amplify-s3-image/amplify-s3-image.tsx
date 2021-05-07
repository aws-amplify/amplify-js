import { Component, Prop, h, State, Host, Watch } from '@stencil/core';
import { Logger } from '@aws-amplify/core';
import { AccessLevel } from '../../common/types/storage-types';
import {
	getStorageObject,
	putStorageObject,
} from '../../common/storage-helpers';

const logger = new Logger('S3Image');

@Component({
	tag: 'amplify-s3-image',
	styleUrl: 'amplify-s3-image.scss',
	shadow: true,
})
export class AmplifyS3Image {
	/** The key of the image object in S3 */
	@Prop() imgKey: string;
	/** String representing directory location to image file */
	@Prop() path: string;
	/** Image body content to be uploaded */
	@Prop() body: object;
	/** The content type header used when uploading to S3 */
	@Prop() contentType: string = 'binary/octet-stream';
	/** The access level of the image */
	@Prop() level: AccessLevel = AccessLevel.Public;
	/** Whether or not to use track on get/put of the image */
	@Prop() track: boolean;
	/** Cognito identity id of the another user's image */
	@Prop() identityId: string;
	/** Function executed when image loads */
	@Prop() handleOnLoad: (event: Event) => void;
	/** Function executed when error occurs for the image */
	@Prop() handleOnError: (event: Event) => void;
	/** Source for the image */
	@State() src: string | object;

	@Watch('body')
	async watchHandler() {
		await this.load();
	}

	async componentWillLoad() {
		await this.load();
	}

	private async load() {
		const { imgKey, path, body, contentType, level, track, identityId } = this;
		if (!imgKey && !path) {
			logger.debug('empty imgKey and path');
			return;
		}

		const key = imgKey || path;
		logger.debug('loading ' + key + '...');

		try {
			if (body) {
				await putStorageObject(imgKey, body, level, track, contentType, logger);
			}
			this.src = await getStorageObject(key, level, track, identityId, logger);
		} catch (err) {
			logger.debug(err);
			throw new Error(err);
		}
	}

	render() {
		return (
			<Host>
				{this.src && (
					<img
						src={this.src as string}
						onLoad={this.handleOnLoad}
						onError={this.handleOnError}
					/>
				)}
			</Host>
		);
	}
}
