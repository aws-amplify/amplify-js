import { Component, Prop, h, State } from '@stencil/core';
import { AccessLevel } from '../../common/types/storage-types';
import { Storage } from '@aws-amplify/storage';
import { Logger, filenameToContentType } from '@aws-amplify/core';
import { NO_STORAGE_MODULE_FOUND } from '../../common/constants';

const logger = new Logger('S3Album');

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
  /* Filter to be applied on album list */
  @Prop() filter;
  /* Sort to be applied on album list */
  @Prop() sort;

  @State() albumItems = [];
  private imgArr = [];

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
      logger.debug('album list', data);
      this.marshal(data);
    } catch (error) {
      logger.warn(error);
    }
  };

  private marshal = list => {
    const contentType = this.contentType || '';
    list.forEach(item => {
      if (item.contentType) {
        return;
      }
      const isString = typeof contentType === 'string';
      item.contentType = isString ? contentType : this.getContentType(item);
      if (!item.contentType) {
        item.contentType = this.getContentType(item);
      }
    });

    let items = this.filter ? this.filter(list) : list;
    items = this.sort ? this.sort(items) : items;
    this.albumItems = items;
    this.splitArr(items);
  };

  getContentType(item) {
    return filenameToContentType(item.key, 'image/*');
  }

  componentWillLoad() {
    this.list();
  }

  splitArr = items => {
    let i;
    let j = items.length;
    for (i = 0; i < j; i += 5) {
      this.imgArr.push(items.slice(i, i + 5));
    }
  };

  render() {
    return (
      <div class="album-container">
        {this.imgArr.map(arr => {
          console.log('arr', arr);
          return (
            <div class="grid-row">
              {arr.map(item => {
                return (
                  <div class="grid-item">
                    <amplify-s3-image imgKey={item.key}></amplify-s3-image>
                    <span class="img-overlay"></span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}
