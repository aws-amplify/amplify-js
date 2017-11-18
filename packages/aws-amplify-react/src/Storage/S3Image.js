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

import { Storage, Logger } from 'aws-amplify';

import AmplifyTheme from '../AmplifyTheme';

const logger = new Logger('Storage.S3Image');

export default class S3Image extends Component {
    constructor(props) {
        super(props);

        this.handleOnLoad = this.handleOnLoad.bind(this);

        this.state = { src: null };
    }

    getImageSource() {
        const { path, level } = this.props;
        Storage.get(path, { level: level? level : 'public' })
            .then(url => {
                this.setState({
                    src: url
                });
            })
            .catch(err => logger.warn(err));
    }

    load() {
        const { path, body, contentType, level } = this.props;
        if (!path) {
            logger.debug('empty path');
            return ;
        }

        const that = this;
        logger.debug('loading ' + path + '...');
        if (body) {
            const type = contentType || 'binary/octet-stream';
            const ret = Storage.put(path, body, type, { level: level? level : 'public' });
            ret.then(data => {
                logger.debug(data);
                that.getImageSource();
            })
            .catch(err => logger.warn(err));
        } else {
            that.getImageSource();
        }
    }

    handleOnLoad(evt) {
        const { onReady } = this.props;
        if (onReady) { onReady(this.state.src); }
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.path !== this.props.path || prevProps.body !== this.props.body) {
            this.load();
        }
    }

    render() {
        const { src } = this.state;
        if (!src) { return null; }

        const theme = this.props.theme || AmplifyTheme;
        const { hidden, style } = this.props;
        const imgStyle = hidden? AmplifyTheme.hidden
                            : Object.assign({}, theme.photo, style);

        return <img style={imgStyle} src={src} onLoad={this.handleOnLoad} />
    }
}
