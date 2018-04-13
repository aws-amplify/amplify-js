'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _Widget = require('../Widget');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _S3Image = require('./S3Image');

var _S3Image2 = _interopRequireDefault(_S3Image);

var _S3Text = require('./S3Text');

var _S3Text2 = _interopRequireDefault(_S3Text);

var _Common = require('./Common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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

var logger = new _awsAmplify.Logger('Storage.S3Album');

var S3Album = function (_Component) {
    _inherits(S3Album, _Component);

    function S3Album(props) {
        _classCallCheck(this, S3Album);

        var _this = _possibleConstructorReturn(this, (S3Album.__proto__ || Object.getPrototypeOf(S3Album)).call(this, props));

        _this.handlePick = _this.handlePick.bind(_this);
        _this.handleClick = _this.handleClick.bind(_this);
        _this.list = _this.list.bind(_this);
        _this.marshal = _this.marshal.bind(_this);

        var theme = _this.props.theme || _AmplifyTheme2.default;
        _this.state = {
            theme: theme,
            items: [],
            ts: new Date().getTime()
        };

        _awsAmplify.Hub.listen('window', _this, 'S3Album');
        return _this;
    }

    _createClass(S3Album, [{
        key: 'getKey',
        value: function getKey(file) {
            var fileToKey = this.props.fileToKey;
            var name = file.name,
                size = file.size,
                type = file.type;

            var key = encodeURI(name);
            if (fileToKey) {
                var callback_type = typeof fileToKey === 'undefined' ? 'undefined' : _typeof(fileToKey);
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
    }, {
        key: 'handlePick',
        value: function handlePick(data) {
            var _this2 = this;

            var that = this;
            var _props = this.props,
                onPick = _props.onPick,
                onLoad = _props.onLoad,
                onError = _props.onError,
                track = _props.track,
                level = _props.level;


            if (onPick) {
                onPick(data);
            }

            var path = this.props.path || '';
            var file = data.file,
                name = data.name,
                size = data.size,
                type = data.type;

            var key = path + this.getKey(data);
            _awsAmplify.Storage.put(key, file, {
                level: level ? level : 'public',
                contentType: type,
                track: track
            }).then(function (data) {
                logger.debug('handle pick data', data);
                var items = _this2.state.items;

                if (items.filter(function (item) {
                    return item.key === key;
                }).length === 0) {
                    var list = items.concat(data);
                    _this2.marshal(list);
                } else {
                    logger.debug('update an item');
                }
                if (onLoad) {
                    onLoad(data);
                }
            }).catch(function (err) {
                logger.debug('handle pick error', err);
                if (onError) {
                    onError(err);
                }
            });
            this.setState({ ts: new Date().getTime() });
        }
    }, {
        key: 'handleClick',
        value: function handleClick(item) {
            var _props2 = this.props,
                onClickItem = _props2.onClickItem,
                select = _props2.select,
                onSelect = _props2.onSelect;

            if (onClickItem) {
                onClickItem(item);
            }

            if (!select) {
                return;
            }

            item.selected = !item.selected;
            this.setState({ items: this.state.items.slice() });

            if (!onSelect) {
                return;
            }

            var selected_items = this.state.items.filter(function (item) {
                return item.selected;
            });
            onSelect(item, selected_items);
        }
    }, {
        key: 'onHubCapsule',
        value: function onHubCapsule(capsule) {
            var theme = this.props.theme || _AmplifyTheme2.default;
            this.setState({ theme: Object.assign({}, theme) });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.list();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (this.props.path == prevProps.path && this.props.ts == prevProps.ts && this.props.select == prevProps.select) {
                return;
            }

            if (!this.props.select) {
                this.state.items.forEach(function (item) {
                    return item.selected = false;
                });
            }
            if (this.props.onSelect) {
                this.props.onSelect(null, []);
            }

            this.list();
        }
    }, {
        key: 'list',
        value: function list() {
            var _this3 = this;

            var _props3 = this.props,
                path = _props3.path,
                level = _props3.level,
                track = _props3.track;

            logger.debug('Album path: ' + path);
            return _awsAmplify.Storage.list(path, { level: level ? level : 'public', track: track }).then(function (data) {
                logger.debug('album list', data);
                _this3.marshal(data);
            }).catch(function (err) {
                logger.warn(err);
                return [];
            });
        }
    }, {
        key: 'contentType',
        value: function contentType(item) {
            return _awsAmplify.JS.filenameToContentType(item.key, 'image/*');
        }
    }, {
        key: 'marshal',
        value: function marshal(list) {
            var _this4 = this;

            var contentType = this.props.contentType || '';
            list.forEach(function (item) {
                if (item.contentType) {
                    return;
                }
                var isString = typeof contentType === 'string';
                item.contentType = isString ? contentType : contentType(item);
                if (!item.contentType) {
                    item.contentType = _this4.contentType(item);
                }
            });

            list = this.filter(list);
            list = this.sort(list);
            this.setState({ items: list });
        }
    }, {
        key: 'filter',
        value: function filter(list) {
            var filter = this.props.filter;

            return filter ? filter(list) : list;
        }
    }, {
        key: 'sort',
        value: function sort(list) {
            var sort = this.props.sort;

            var typeof_sort = typeof sort === 'undefined' ? 'undefined' : _typeof(sort);
            if (typeof_sort === 'function') {
                return sort(list);
            }

            if (['string', 'undefined'].includes(typeof_sort)) {
                var sort_str = sort ? sort : 'lastModified';
                var parts = sort_str.split(/\s+/);
                var field = parts[0];
                var dir = parts.length > 1 ? parts[1] : '';
                if (field === 'lastModified') {
                    dir = dir === 'asc' ? 'asc' : 'desc';
                } else {
                    dir = dir === 'desc' ? 'desc' : 'asc';
                }
                _awsAmplify.JS.sortByField(list, field, dir);

                return list;
            }

            logger.warn('invalid sort. done nothing. should be a string or function');
            return list;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props4 = this.props,
                picker = _props4.picker,
                translateItem = _props4.translateItem,
                level = _props4.level;
            var _state = this.state,
                items = _state.items,
                ts = _state.ts;


            var pickerTitle = this.props.pickerTitle || 'Pick';

            var theme = this.props.theme || _AmplifyTheme2.default;

            var list = items.map(function (item) {
                var isText = item.contentType && _awsAmplify.JS.isTextFile(item.contentType);
                return isText ? _react2.default.createElement(_S3Text2.default, {
                    key: item.key,
                    textKey: item.key,
                    theme: theme,
                    style: theme.albumText,
                    selected: item.selected,
                    translate: translateItem,
                    level: level,
                    onClick: function onClick() {
                        return _this5.handleClick(item);
                    }
                }) : _react2.default.createElement(_S3Image2.default, {
                    key: item.key,
                    imgKey: item.key,
                    theme: theme,
                    style: theme.albumPhoto,
                    selected: item.selected,
                    translate: translateItem,
                    level: level,
                    onClick: function onClick() {
                        return _this5.handleClick(item);
                    }
                });
            });
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { style: theme.album },
                    list
                ),
                picker ? _react2.default.createElement(_Widget.Picker, {
                    key: ts,
                    title: pickerTitle,
                    accept: 'image/*, text/*',
                    onPick: this.handlePick,
                    theme: theme
                }) : null
            );
        }
    }]);

    return S3Album;
}(_react.Component);

exports.default = S3Album;