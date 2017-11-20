'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Hidden = exports.Center = exports.Col6 = exports.Col4 = exports.Col3 = exports.Col2 = exports.Label = exports.A = exports.PhotoPickerInput = exports.PhotoPickerButton = exports.PhotoPickerPicker = exports.PhotoPicker = exports.PhotoImg = exports.Photo = exports.AlbumPhoto = exports.Album = exports.Button = exports.Input = exports.ActionRow = exports.FormRow = exports.SectionFooter = exports.SectionBody = exports.SectionHeader = exports.NavButton = exports.NavRight = exports.NavBar = exports.ErrorSection = exports.FormSection = exports.Section = exports.Container = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
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

var _awsAmplify = require('aws-amplify');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Container = exports.Container = {
    fontFamily: '-apple-system,\n                BlinkMacSystemFont,\n                "Segoe UI",\n                Roboto,\n                "Helvetica Neue",\n                Arial,\n                sans-serif,\n                "Apple Color Emoji",\n                "Segoe UI Emoji",\n                "Segoe UI Symbol"',
    textAlign: 'center'
};

var Section = exports.Section = {
    fontWeight: '200'
};

var FormSection = exports.FormSection = {
    display: 'inline-block',
    fontWeight: '200'
};

var ErrorSection = exports.ErrorSection = {
    background: 'orange',
    padding: '0.5em',
    margin: '0.2em auto',
    fontWeight: '300'
};

var NavBar = exports.NavBar = {
    padding: '0.5em 0.5em 0.2em',
    marginBottom: '0.5em',
    borderBottom: '1px solid #00fff6'
};

var NavRight = exports.NavRight = {
    textAlign: 'right',
    fontSize: '0.8em'
};

var NavButton = exports.NavButton = {
    padding: '0',
    border: 'none',
    borderBottom: '1px solid #007bff',
    margin: 'auto 0.3em',
    background: '#fff',
    color: '#007bff'
};

var SectionHeader = exports.SectionHeader = {
    background: '#007bff',
    color: '#fff',
    padding: '0.6em',
    fontSize: '1.2em',
    fontWeight: 'normal',
    textAlign: 'center'
};

var SectionBody = exports.SectionBody = {
    background: '#fff',
    color: '#000',
    padding: '1em',
    fontSize: '1em'
};

var SectionFooter = exports.SectionFooter = {
    background: '#fff',
    color: '#000',
    padding: '1em',
    fontSize: '0.8em',
    textAlign: 'left',
    borderBottom: '1px solid #00fff6'
};

var FormRow = exports.FormRow = {
    marginBottom: '0.5em',
    textAlign: 'left'
};

var ActionRow = exports.ActionRow = {
    marginTop: '1.5em',
    textAlign: 'right'
};

var Input = exports.Input = {
    fontSize: '1em',
    fontWeight: '200',
    width: '15em',
    padding: '4px 2px',
    border: '1px solid #aaa'
};

var Button = exports.Button = {
    fontSize: '1em',
    padding: '0.3em 0.5em',
    margin: 'auto 0.3em',
    border: '1px solid #007bff',
    background: '#fff',
    color: '#007bff'
};

var Album = exports.Album = {
    display: 'block',
    width: '100%',
    textAlign: 'left'
};

var AlbumPhoto = exports.AlbumPhoto = {
    display: 'inline-block',
    width: '32.5%',
    margin: '0.2%',
    verticalAlign: 'top'
};

var Photo = exports.Photo = {
    display: 'inline-block',
    width: '32.5%',
    margin: '0.2%',
    verticalAlign: 'top'
};

var PhotoImg = exports.PhotoImg = {
    maxWidth: '100%'
};

var PhotoPicker = exports.PhotoPicker = {
    width: '100%',
    textAlign: 'center'
};

var PhotoPickerPicker = exports.PhotoPickerPicker = {
    width: '100%',
    textAlign: 'center'
};

var PhotoPickerButton = exports.PhotoPickerButton = {
    background: '#fff',
    border: '1px solid #ccc',
    fontWeight: '200',
    width: '100%'
};

var PhotoPickerInput = exports.PhotoPickerInput = {};

var A = exports.A = {
    textDecoration: 'underline'
};

var Label = exports.Label = {
    margin: 'auto 0.5em'
};

var Col2 = exports.Col2 = {
    display: 'inline-block',
    width: '16.66%'
};

var Col3 = exports.Col3 = {
    display: 'inline-block',
    width: '24.5%',
    margin: '0.2%'
};

var Col4 = exports.Col4 = {
    display: 'inline-block',
    width: '32%',
    margin: '0.2%'
};

var Col6 = exports.Col6 = {
    display: 'inline-block',
    width: '49.5%',
    margin: '0.2%'
};

var Center = exports.Center = {
    textAlign: 'center'
};

var Hidden = exports.Hidden = {
    display: 'none'
};

var AmplifyTheme = {
    container: Container,
    navBar: NavBar,
    navRight: NavRight,
    navButton: NavButton,

    section: Section,
    sectionHeader: SectionHeader,
    sectionBody: SectionBody,
    sectionFooter: SectionFooter,

    formSection: FormSection,
    formRow: FormRow,
    actionRow: ActionRow,
    input: Input,
    button: Button,

    errorSection: ErrorSection,

    photo: Photo,
    photoImg: PhotoImg,
    album: Album,
    albumPhoto: AlbumPhoto,
    photoPicker: PhotoPicker,
    photoPickerPicker: PhotoPickerPicker,
    photoPickerButton: PhotoPickerButton,
    photoPickerInput: PhotoPickerInput,

    a: A,
    label: Label,

    col3: Col3,
    col4: Col4,
    col6: Col6,

    center: Center,
    hidden: Hidden
};

var MediaQuery = function () {
    function MediaQuery() {
        _classCallCheck(this, MediaQuery);
    }

    _createClass(MediaQuery, [{
        key: 'query',
        value: function () {
            function query() {
                var dim = _awsAmplify.ClientDevice.dimension();
                var width = dim.width,
                    height = dim.height;


                if (width < 576) {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col6);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col6);
                } else if (width < 768) {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col4);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col4);
                } else if (width < 992) {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col3);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col3);
                } else {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col2);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col2);
                }
            }

            return query;
        }()
    }, {
        key: 'onHubCapsule',
        value: function () {
            function onHubCapsule() {
                this.query();
            }

            return onHubCapsule;
        }()
    }]);

    return MediaQuery;
}();

var mediaQuery = new MediaQuery();
mediaQuery.query();
_awsAmplify.Hub.listen('window', mediaQuery, 'AmplifyTheme');

exports['default'] = AmplifyTheme;