import { Component, Prop, h, State } from '@stencil/core';
import { AccessLevel, StorageObject } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger, filenameToContentType, I18n } from '@aws-amplify/core';
import { NO_STORAGE_MODULE_FOUND } from '../../common/constants';
import {
	calcKey,
	imageFileType,
	putStorageObject,
} from '../../common/storage-helpers';
import { v4 as uuid } from 'uuid';
import { Translations } from '../../common/Translations';

const logger = new Logger('S3Album');

@Component({
	tag: 'amplify-s3-album',
	styleUrl: 'amplify-s3-album.scss',
	shadow: true,
})
export class AmplifyS3Album {
	/** String representing directory location of image files to be listed */
	@Prop() path: string;
	/** The content type header used when uploading to S3 */
	@Prop() contentType: string = 'binary/octet-stream';
	/** The access level of the files */
	@Prop() level: AccessLevel = AccessLevel.Public;
	/** Whether or not to use track the get/put of the listing of images */
	@Prop() track: boolean;
	/** Cognito identity id of the another user's image list */
	@Prop() identityId: string;
	/** Callback used to generate custom key value */
	@Prop() fileToKey: (data: object) => string | string;
	/** Filter to be applied on album list */
	@Prop() filter: (list: StorageObject[]) => StorageObject[];
	/** Sort to be applied on album list */
	@Prop() sort: (list: StorageObject[]) => StorageObject[];
	/** Boolean to enable or disable picker */
	@Prop() picker: boolean = true;
	/** Function executed when s3-image loads */
	@Prop() handleOnLoad: (event: Event) => void;
	/** Function executed when error occurs for the s3-image */
	@Prop() handleOnError: (event: Event) => void;
	/** Picker button text */
	@Prop() pickerText: string = Translations.PICKER_TEXT;

	@State() albumItems: StorageObject[] = [];

	private imgArr = {};

	private list = async () => {
		const { path = '', level, track, identityId } = this;
		logger.debug('Album path: ' + path);
		if (!Storage || typeof Storage.list !== 'function') {
			throw new Error(NO_STORAGE_MODULE_FOUND);
		}

		try {
			const data = await Storage.list(path, {
				level,
				track,
				identityId,
			});
			this.marshal(data);
		} catch (error) {
			logger.warn(error);
		}
	};

	private marshal = (list: StorageObject[]) => {
		list.forEach((item: StorageObject) => {
			const name = item.key.toLowerCase();
			const ext = name.split('.')[1];
			if (imageFileType.has(ext)) {
				if (
					!item.contentType ||
					(item.contentType && item.contentType === 'binary/octet-stream')
				) {
					item.contentType = this.getContentType(item);
				}
			}
		});
		const filtered = list.filter(
			(item: StorageObject) =>
				item.contentType && item.contentType.startsWith('image/')
		);
		let items = this.filter ? this.filter(filtered) : filtered;
		items = this.sort ? this.sort(items) : items;
		this.albumItems = items;
		logger.debug('album items', this.albumItems);
		this.constructImgArray(this.albumItems);
	};

	private getContentType(item: StorageObject) {
		return filenameToContentType(item.key, 'image/*');
	}

	componentWillLoad() {
		this.list();
	}

	private constructImgArray = (list: StorageObject[]) => {
		list.map(item => {
			this.imgArr[`${item['key']}`] = item['key'];
		});
	};

	private handlePick = async (event: Event) => {
		const file = (event.target as HTMLInputElement).files[0];
		const { path = '', level, track, fileToKey } = this;
		const key = path + calcKey(file, fileToKey);

		try {
			await putStorageObject(key, file, level, track, file['type'], logger);
		} catch (error) {
			logger.error(error);
			throw new Error(error);
		}

		if (Object.keys(this.imgArr).includes(key)) {
			this.albumItems = [...this.albumItems];
			this.imgArr[key] = `${key}-${uuid()}`;
		} else {
			const filtered = [
				...this.albumItems,
				...(this.filter ? this.filter([{ key }]) : [{ key }]),
			];
			this.albumItems = this.sort ? this.sort(filtered) : filtered;
		}
	};

	render() {
		return (
			<div>
				<div class="album-container">
					<div class="grid-row">
						{this.albumItems.map(item => {
							return (
								<div class="grid-item" key={`key-${item.key}`}>
									<amplify-s3-image
										key={this.imgArr[item.key]}
										imgKey={item.key}
										level={this.level}
										path={this.path}
										identityId={this.identityId}
										track={this.track}
										handleOnError={this.handleOnError}
										handleOnLoad={this.handleOnLoad}
									></amplify-s3-image>
									<span class="img-overlay"></span>
								</div>
							);
						})}
					</div>
				</div>

				{this.picker && (
					<amplify-picker
						pickerText={I18n.get(this.pickerText)}
						inputHandler={e => this.handlePick(e)}
						acceptValue="image/*"
					/>
				)}
			</div>
		);
	}
}
