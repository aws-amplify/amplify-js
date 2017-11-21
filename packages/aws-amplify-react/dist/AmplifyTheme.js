'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Hidden = exports.Center = exports.HalfHeight = exports.Col12 = exports.Col10 = exports.Col9 = exports.Col8 = exports.Col6 = exports.Col4 = exports.Col3 = exports.Col2 = exports.Pre = exports.Label = exports.A = exports.PickerInput = exports.PickerButton = exports.PickerPicker = exports.Picker = exports.Text = exports.AlbumText = exports.PhotoImg = exports.Photo = exports.AlbumPhoto = exports.Album = exports.Button = exports.Input = exports.ActionRow = exports.FormRow = exports.SectionFooter = exports.SectionBody = exports.SectionHeader = exports.NavButton = exports.NavRight = exports.NavBar = exports.ErrorSection = exports.FormSection = exports.Section = exports.Container = undefined;

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

var AlbumText = exports.AlbumText = {
    display: 'inline-block',
    width: '32.5%',
    margin: '0.2%',
    verticalAlign: 'top',
    maxHeight: 320,
    overflow: 'auto'
};

var Text = exports.Text = {
    display: 'inline-block',
    width: '32.5%',
    margin: '0.2%',
    verticalAlign: 'top',
    maxHeight: 320,
    overflow: 'auto'
};

var Picker = exports.Picker = {
    width: '100%',
    textAlign: 'center'
};

var PickerPicker = exports.PickerPicker = {
    width: '100%',
    textAlign: 'center'
};

var PickerButton = exports.PickerButton = {
    background: '#fff',
    border: '1px solid #ccc',
    fontWeight: '200',
    width: '100%'
};

var PickerInput = exports.PickerInput = {};

var A = exports.A = {
    textDecoration: 'underline'
};

var Label = exports.Label = {
    margin: 'auto 0.5em'
};

var Pre = exports.Pre = {
    textAlign: 'left',
    margin: '0',
    padding: '1em',
    background: '#eee',
    overflow: 'auto'
};

var Col2 = exports.Col2 = {
    display: 'inline-block',
    width: '16.6%'
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

var Col8 = exports.Col8 = {
    display: 'inline-block',
    width: '66%',
    margin: '0.2%'
};

var Col9 = exports.Col9 = {
    display: 'inline-block',
    width: '74.5%',
    margin: '0.2%'
};

var Col10 = exports.Col10 = {
    display: 'inline-block',
    width: '83.6%',
    margin: '0.2%'
};

var Col12 = exports.Col12 = {
    display: 'inline-block',
    width: '99.2%',
    margin: '0.2%'
};

var HalfHeight = exports.HalfHeight = {
    height: 320,
    overflow: 'auto'
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
    text: Text,
    album: Album,
    albumPhoto: AlbumPhoto,
    albumText: AlbumText,
    picker: Picker,
    pickerPicker: PickerPicker,
    pickerButton: PickerButton,
    pickerInput: PickerInput,

    a: A,
    label: Label,
    pre: Pre,

    col3: Col3,
    col4: Col4,
    col6: Col6,
    col8: Col8,
    col9: Col9,
    col10: Col10,
    col12: Col12,
    halfHeight: HalfHeight,

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
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col12);
                    AmplifyTheme.albumText = Object.assign({}, AlbumText, Col12);
                } else if (width < 768) {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col4);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col6);
                    AmplifyTheme.albumText = Object.assign({}, AlbumText, Col8);
                } else if (width < 992) {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col3);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col6);
                    AmplifyTheme.albumText = Object.assign({}, AlbumText, Col6);
                } else {
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumPhoto, Col2);
                    AmplifyTheme.Photo = Object.assign({}, Photo, Col4);
                    AmplifyTheme.albumPhoto = Object.assign({}, AlbumText, Col4);
                }

                AmplifyTheme.halfHeight = Object.assign({}, HalfHeight, { height: height / 2 });
                AmplifyTheme.text = Object.assign({}, AmplifyTheme.text, { maxHeight: height / 2 });
                AmplifyTheme.albumText = Object.assign({}, AmplifyTheme.albumText, { maxHeight: height / 3 });
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