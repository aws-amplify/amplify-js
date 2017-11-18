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
import { ScrollView } from 'react-native';

import Storage from '../../Storage';
import { ConsoleLogger as Logger } from '../../Common';
import AmplifyTheme from '../AmplifyTheme';
import S3Image from './S3Image';

const logger = new Logger('Storage.S3Album');

export default class S3Album extends Component {
    constructor(props) {
        super(props);

        this.state = { images: [] };
    }

    componentDidMount() {
        const { path, level, filter } = this.props;
        logger.debug(path);
        Storage.list(path, { level: level? level : 'public' })
            .then(data => {
                logger.debug(data);
                if (filter) { data = filter(data); }
                this.setState({ images: data });
            })
            .catch(err => logger.warn(err));
    }

    render() {
        const { images } = this.state;
        if (!images) { return null; }

        const imageStyle = this.props.imageStyle || { width: 100, height: 100 };
        const theme = this.props.theme || AmplifyTheme;
        const list = this.state.images.map(image => {
            return <S3Image key={image.key} path={image.key} theme={theme} />
        });
        return (
            <ScrollView {...this.props} style={theme.album}>
                {list}
            </ScrollView>
        )
    }
}
