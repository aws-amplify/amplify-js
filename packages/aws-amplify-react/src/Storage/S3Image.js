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

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';

import AmplifyTheme from '../AmplifyTheme';
import { transparent1X1 } from '../AmplifyUI';
import { PhotoPicker } from '../Widget';
import { calcKey } from './Common';

const logger = new Logger('Storage.S3Image');

export default class S3Image extends Component {
    constructor(props) {
        super(props);

        this.handleOnLoad = this.handleOnLoad.bind(this);
        this.handleOnError = this.handleOnError.bind(this);
        this.handlePick = this.handlePick.bind(this);
        this.handleClick = this.handleClick.bind(this);

        const initSrc = this.props.src || transparent1X1;

        this.state = { src: initSrc };
    }

    getImageSource(key, level, track) {
        if (!Storage || typeof Storage.get !== 'function') {
            throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
        }
        Storage.get(key, { level: level? level : 'public', track })
            .then(url => {
                this.setState({
                    src: url
                });
            })
            .catch(err => logger.debug(err));
    }

    load() {
        const { imgKey, path, body, contentType, level, track } = this.props;
        if (!imgKey && !path) {
            logger.debug('empty imgKey and path');
            return ;
        }

        const that = this;
        const key = imgKey || path;
        logger.debug('loading ' + key + '...');
        if (body) {
            const type = contentType || 'binary/octet-stream';
            if (!Storage || typeof Storage.put !== 'function') {
                throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
            }
            const ret = Storage.put(key, body, {
                contentType: type,
                level: level? level : 'public',
                track
            });
            ret.then(data => {
                logger.debug(data);
                that.getImageSource(key, level, track);
            })
            .catch(err => logger.debug(err));
        } else {
            that.getImageSource(key, level, track);
        }
    }

    handleOnLoad(evt) {
        const { onLoad } = this.props;
        if (onLoad) { onLoad(this.state.src); }
    }

    handleOnError(evt) {
        const { onError } = this.props;
        if (onError) { onError(this.state.src); }
    }

    handlePick(data) {
        const that = this;

        const path = this.props.path || '';
        const { imgKey, level, fileToKey, track } = this.props;
        const { file, name, size, type } = data;
        const key = imgKey || (path + calcKey(data, fileToKey));
        if (!Storage || typeof Storage.put !== 'function') {
            throw new Error('No Storage module found, please ensure @aws-amplify/storage is imported');
        }
        Storage.put(key, file, { 
            level: level? level: 'public',
            contentType: type, 
            track 
        })
            .then(data => {
                logger.debug('handle pick data', data);
                that.getImageSource(key, level, track);
            })
            .catch(err => logger.debug('handle pick error', err));
    }

    handleClick(evt) {
        const { onClick } = this.props;
        if (onClick) { onClick(evt); }
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        const update = prevProps.path !== this.props.path ||
                        prevProps.imgKey !== this.props.imgKey ||
                        prevProps.body !== this.props.body;
        if (update) {
            this.load();
        }
    }

    imageEl(src, theme) {
        if (!src) { return null; }

        const { selected } = this.props;
        const containerStyle = { position: 'relative' };
        return (
            <div style={containerStyle} onClick={this.handleClick}>
                <img
                    style={theme.photoImg}
                    src={src}
                    onLoad={this.handleOnLoad}
                    onError={this.handleOnError}
                />
                <div style={selected? theme.overlaySelected : theme.overlay}></div>
            </div>
        )
    }

    render() {
        const { hidden, style, picker, translate, imgKey } = this.props;
        let src = this.state.src;
        if (translate) {
            src = (typeof translate === 'string')? translate : translate({
                type: 'image',
                key: imgKey,
                content: src
            });
        }
        if (!src && !picker) { return null; }

        const theme = this.props.theme || AmplifyTheme;
        const photoStyle = hidden? AmplifyTheme.hidden
                                 : Object.assign({}, theme.photo, style);

        return (
            <div style={photoStyle}>
                { photoStyle? this.imageEl(src, theme): null }
                { picker? <div>
                              <PhotoPicker
                                  key="picker"
                                  onPick={this.handlePick}
                                  theme={theme}
                              />
                          </div> : null
                }
            </div>
        )
    }
}
