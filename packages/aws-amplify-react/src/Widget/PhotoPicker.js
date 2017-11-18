import React, { Component } from 'react';

import { Logger } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';

const PickerContainer = {
    position: 'relative'
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

    handleImageError(e) {
        this.setState({ ImgSrc: default_img_src });
    }

    handleInput(e) {
        var that = this;

        const file = e.target.files[0];
        logger.debug(file);

        const { onPick } = this.props;
        if (onPick) {
            const { name, size, type } = file;
            onPick({
                file: file,
                name: name,
                size: size,
                type: type
            });
        }
    }

    render() {
        const theme = this.props.theme || AmplifyTheme;
        const containerStyle = Object.assign({}, PickerContainer, theme.photoPicker);
        const buttonStyle = Object.assign({}, PickerButton, theme.photoPickerButton);
        const inputStyle = Object.assign({}, PickerInput, theme.photoPickerInput);

        return (
            <div style={containerStyle}>
                <button style={buttonStyle}>
                    Pick a Photo
                </button>
                <input
                    title="Pick  Photo"
                    type="file" accept="image/*"
                    style={inputStyle}
                    onChange={(e) => this.handleInput(e)}
                />
            </div>
        )
    }
}
