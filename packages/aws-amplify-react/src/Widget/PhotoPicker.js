import React, { Component } from 'react';

import { I18n, Logger } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';

const Picker = {
}

const PickerPicker = {
    position: 'relative'
}

const PickerPreview = {
    maxWidth: '100%'
}

const PickerButton = {
    width: '10em',
    height: '3em',
    fontSize: '1.2em',
    textAlign: 'center'
}

const PickerInput = {
    width: '100%',
    height: '100%',
    display: 'inline-block',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    cursor: 'pointer'
}

const logger = new Logger('PhotoPicker');

export default class PhotoPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            previewSrc: props.previewSrc
        };
    }

    handleInput(e) {
        var that = this;

        const file = e.target.files[0];
        const { name, size, type } = file;
        logger.debug(file);

        const { preview, onPick, onLoad } = this.props;

        if (onPick) {
            onPick({
                file: file,
                name: name,
                size: size,
                type: type
            });
        }

        if (preview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const url = e.target.result;
                that.setState({ previewSrc: url });
                if (onLoad) { onLoad(url); }
            }
            reader.readAsDataURL(file);
        }
    }

    render() {
        const { preview } = this.props;
        const { previewSrc } = this.state;

        const title = this.props.title || 'Pick a Photo';

        const theme = this.props.theme || AmplifyTheme;
        const containerStyle = Object.assign({}, Picker, theme.photoPicker);
        const previewStyle = Object.assign(
            {},
            PickerPreview,
            theme.photoPickerPreview,
            (preview && preview !== 'hidden')? {} : AmplifyTheme.hidden);
        const pickerStyle = Object.assign(
            {},
            PickerPicker,
            theme.photoPickerPicker
        );
        const buttonStyle = Object.assign({}, PickerButton, theme.photoPickerButton);
        const inputStyle = Object.assign({}, PickerInput, theme.photoPickerInput);

        return (
            <div style={containerStyle}>
                { previewSrc? <img src={previewSrc} style={previewStyle} /> : null }
                <div style={pickerStyle}>
                    <button style={buttonStyle}>
                        {I18n.get(title)}
                    </button>
                    <input
                        title={I18n.get(title)}
                        type="file" accept="image/*"
                        style={inputStyle}
                        onChange={(e) => this.handleInput(e)}
                    />
                </div>
            </div>
        )
    }
}
