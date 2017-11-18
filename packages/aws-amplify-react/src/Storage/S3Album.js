/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import React, { Component } from 'react';

import { Storage, Logger, Hub, ClientDevice } from 'aws-amplify';
import { PhotoPicker } from '../Widget';
import AmplifyTheme from '../AmplifyTheme';
import S3Image from './S3Image';

const logger = new Logger('Storage.S3Album');

export default class S3Album extends Component {
    constructor(props) {
        super(props);

        this.handlePick = this.handlePick.bind(this);

        const theme = this.props.theme || AmplifyTheme;
        this.state = {
            theme: theme,
            images: []
        };

        Hub.listen('window', this, 'S3Album');
    }

    getKey(file) {
        const { fileToKey } = this.props;

        const { name, size, type } = file;
        let key = encodeURI(name);
        if (fileToKey) {
            const callback_type = typeof fileToKey;
            if (callback_type === 'string') {
                key = fileToKey;
            } else if (callback_type === 'function') {
                key = fileToKey({ name: name, size: size, type: type });
            } else {
                key = encodeURI(JSON.stringify(fileToKey));
            }
            if (!key) {
                logger.debug('key is empty');
                key = 'empty_key';
            }
        }

        return key.replace(/\s/g, '_');
    }

    handlePick(data) {
        const that = this;

        const path = this.props.path || '';
        const { file, name, size, type } = data;
        const key = path + this.getKey(data);
        Storage.put(key, file, { contentType: type })
            .then(data => {
                logger.debug('handle pick data', data);
                that.addImage(data.key);
            })
            .catch(err => logger.debug('handle pick error', err));
    }

    addImage(key) {
        const theme = this.props.theme || AmplifyTheme;
        const image = <S3Image key={key} path={key} theme={theme} />
        const images = this.state.images;
        if (images.filter(image => image.key === key).length === 0) {
            this.setState({ images: images.concat(image) });
        } else {
            logger.debug('update an image');
        }
    }

    onHubCapsule(capsule) {
        const theme = this.props.theme || AmplifyTheme;
        this.setState({ theme: Object.assign({}, theme) });
    }

    componentDidMount() {
        const { path, filter, level } = this.props;
        logger.debug('Album path: ' + path);
        Storage.list(path, { level: level? level : 'public' })
            .then(data => {
                logger.debug('album list', data);
                if (filter) { data = filter(data); }
                this.setState({ images: data });
            })
            .catch(err => logger.warn(err));
    }

    render() {
        const { picker } = this.props;
        const { images } = this.state;

        const theme = this.props.theme || AmplifyTheme;
        const pickerContainerStyle = Object.assign({}, theme.album, theme.center);

        const list = this.state.images.map(image => {
            return <S3Image
                        key={image.key}
                        path={image.key}
                        theme={theme}
                        style={theme.albumPhoto}
                    />
        });
        return (
            <div>
                <div style={theme.album}>
                    {list}
                </div>
                { picker? <div style={pickerContainerStyle}>
                              <PhotoPicker key="picker" onPick={this.handlePick} theme={theme} />
                          </div>
                        : null
                }
            </div>
        )
    }
}
