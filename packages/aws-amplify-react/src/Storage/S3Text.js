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
import { TextPicker } from '../Widget';
import { calcKey } from './Common';

const logger = new Logger('Storage.S3Text');

export default class S3Text extends Component {
    constructor(props) {
        super(props);

        this.handleOnLoad = this.handleOnLoad.bind(this);
        this.handleOnError = this.handleOnError.bind(this);
        this.handlePick = this.handlePick.bind(this);

        const { text, textKey } = props;
        this.state = {
            text: text || '',
            textKey: textKey || ''
        };
    }

    getText(key, level) {
        Storage.get(key, { download: true, level: level? level : 'public' })
            .then(data => {
                logger.debug(data);
                this.setState({
                    textKey: key,
                    text: data.Body.toString('utf8')
                });
            })
            .catch(err => logger.debug(err));
    }

    load() {
        const { textKey } = this.state;
        const { path, body, contentType, level } = this.props;
        if (!textKey && !path) {
            logger.debug('empty textKey and path');
            return ;
        }

        const that = this;
        const key = textKey || path;
        logger.debug('loading ' + key + '...');
        if (body) {
            const type = contentType || 'text/*';
            const ret = Storage.put(key, body, type, { level: level? level : 'public' });
            ret.then(data => {
                logger.debug(data);
                that.getText(key, level);
            })
            .catch(err => logger.debug(err));
        } else {
            that.getText(key, level);
        }
    }

    handleOnLoad(evt) {
        const { onLoad } = this.props;
        if (onLoad) { onLoad(this.state.text); }
    }

    handleOnError(evt) {
        const { onError } = this.props;
        if (onError) { onError(this.state.text); }
    }

    handlePick(data) {
        const that = this;

        const { textKey } = this.state;
        const path = this.props.path || '';
        const { level, fileToKey } = this.props;
        const { file, name, size, type } = data;
        const key = textKey || (path + calcKey(data, fileToKey));
        Storage.put(key, file, { contentType: type })
            .then(data => {
                logger.debug('handle pick data', data);
                that.getText(key, level);
            })
            .catch(err => logger.debug('handle pick error', err));
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
        const { text } = this.state;
        const { hidden, style, picker } = this.props;
        if (!text && !picker) { return null; }

        const theme = this.props.theme || AmplifyTheme;
        const textStyle = hidden? AmplifyTheme.hidden
                                : Object.assign({}, theme.text, style);

        return (
            <div style={textStyle}>
                { text? <pre
                            style={theme.pre}
                            onLoad={this.handleOnLoad}
                            onError={this.handleOnError}
                        >{text}</pre>
                      : null
                }
                { picker? <div>
                              <TextPicker
                                  key="picker"
                                  onPick={this.handlePick}
                                  theme={theme}
                              />
                          </div>
                        : null
                }
            </div>
        )
    }
}
