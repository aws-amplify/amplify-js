import { Component, Prop, h, State } from '@stencil/core';
import { AccessLevel } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger, filenameToContentType } from '@aws-amplify/core';
import { NO_STORAGE_MODULE_FOUND } from '../../common/constants';
import { calcKey } from '../../common/helpers';
import { v4 as uuid } from 'uuid';

const logger = new Logger('S3Album');
const imageFileType = [
  'apng',
  'bmp',
  'gif',
  'ico',
  'cur',
  'jpg',
  'jpeg',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
];
@Component({
  tag: 'amplify-s3-album',
  styleUrl: 'amplify-s3-album.scss',
  shadow: true,
})
export class AmplifyS3Album {
  /* String representing directory location to text file */
  @Prop() path: string;
  /* The content type header used when uploading to S3 */
  @Prop() contentType: string = 'binary/octet-stream';
  /* The access level of the image */
  @Prop() level: AccessLevel = AccessLevel.Public;
  /* Whether or not to use track the get/put of the image */
  @Prop() track: boolean;
  /* Cognito identity id of the another user's image */
  @Prop() identityId: string;
  /* Callback used to generate custom key value */
  @Prop() fileToKey: (data: object) => string;
  /* Filter to be applied on album list */
  @Prop() filter;
  /* Sort to be applied on album list */
  @Prop() sort;
  /* Boolean to enable or disable picker */
  @Prop() picker: boolean = true;

  @State() albumItems = [];

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

  private marshal = list => {
    list.forEach(item => {
      const name = item.key.toLowerCase();
      const ext = name.split('.')[1];
      if (imageFileType.includes(ext)) {
        if (!item.contentType || (item.contentType && item.contentType === 'binary/octet-stream')) {
          item.contentType = this.getContentType(item);
        }
      }
    });
    logger.debug('sanitized album list', list);
    const filtered = list.filter(item => item.contentType && item.contentType.startsWith('image/'));
    let items = this.filter ? this.filter(filtered) : filtered;
    items = this.sort ? this.sort(items) : items;
    this.albumItems = items;
    logger.debug('album items', this.albumItems);
    this.constructImgArray(this.albumItems);
  };

  getContentType(item) {
    return filenameToContentType(item.key, 'image/*');
  }

  componentWillLoad() {
    this.list();
  }

  constructImgArray = list => {
    list.map(item => {
      this.imgArr[`${item['key']}`] = item['key'];
    });
    console.log(this.imgArr);
  };

  handlePick = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files[0];
    const { path = '', level, track, fileToKey } = this;
    const key = path + calcKey(file, fileToKey);

    if (!Storage || typeof Storage.put !== 'function') {
      throw new Error(NO_STORAGE_MODULE_FOUND);
    }

    try {
      const data = await Storage.put(key, file, {
        level,
        contentType: file['type'],
        track,
      });
      logger.debug(data);
      if (Object.keys(this.imgArr).includes(key)) {
        this.albumItems = [...this.albumItems];
        this.imgArr[key] = `${key}-${uuid()}`;
      } else {
        this.albumItems = [...this.albumItems, { key }];
        this.imgArr[key] = key;
      }
    } catch (error) {
      logger.error(error);
      throw new Error(error);
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
                    fileToKey={this.fileToKey}
                    track={this.track}
                  ></amplify-s3-image>
                  <span class="img-overlay"></span>
                </div>
              );
            })}
          </div>
        </div>

        {this.picker && <amplify-picker inputHandler={e => this.handlePick(e)} acceptValue="image/*" />}
      </div>
    );
  }
}
